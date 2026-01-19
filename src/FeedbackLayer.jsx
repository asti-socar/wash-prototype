import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { X, Send } from 'lucide-react';

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FeedbackLayer({ isModeActive, pageId, isHideComments }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newComment, setNewComment] = useState(null); // { x, y, x_percent, y_percent }
  const [lockedPinId, setLockedPinId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [author, setAuthor] = useState(() => localStorage.getItem('feedback_author') || '');
  const [message, setMessage] = useState('');

  // 1. 초기 데이터 패칭
  const fetchFeedbacks = async () => {
    if (!pageId) return;
    const { data, error } = await supabase
      .from('prototype_comments')
      .select('*')
      .eq('page_path', pageId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching feedbacks:', error);
    else setFeedbacks(data);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [pageId]);

  // 2. 실시간 구독 설정
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${pageId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prototype_comments', 
        filter: `page_path=eq.${pageId}` 
      }, (payload) => {
        // 변경 사항 발생 시 리스트 새로고침
        fetchFeedbacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  // 3. 전역 키보드/클릭 이벤트 핸들러 (ESC 지원)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;

      if (lockedPinId) {
        setLockedPinId(null);
        return;
      }

      if (newComment) {
        if (message.trim() && !window.confirm('작성 중인 내용이 있습니다. 정말로 닫으시겠습니까?')) {
          return;
        }
        setNewComment(null);
        setMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockedPinId, newComment, message]);

  // 4. 해결(완료) 처리 - 안정성 강화 버전
  const handleResolve = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    // 해결(완료) 컨펌 로직 추가
    if (!window.confirm("피드백을 정말 완료 처리할까요?")) {
      return;
    }

    if (resolvingId) return;
    setResolvingId(id);

    try {
      const { data, error } = await supabase
        .from('prototype_comments')
        .update({ is_resolved: true })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase 에러:', error.message);
        alert(`실패: ${error.message}`);
      } else if (data && data.length > 0) {
        setLockedPinId(null);
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      } else {
        alert("수정 권한이 없거나 정책 오류입니다. (UPDATE 정책 확인 필요)");
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
    } finally {
      setResolvingId(null);
    }
  };

  // 5. 외부 클릭 핸들러 (레이어 클릭 시 새 댓글 또는 팝업 닫기)
  const handleLayerClick = (e) => {
    if (e.target.closest('.qna-pin') || e.target.closest('.feedback-form')) return;

    if (lockedPinId) {
      setLockedPinId(null);
      return;
    }

    if (newComment) {
      if (message.trim() && !window.confirm('작성을 종료하시겠습니까?')) return;
      setNewComment(null);
      setMessage('');
      return;
    }

    if (isModeActive) {
      // 좌표 저장 시 pageX/pageY를 사용하여 스크롤된 위치까지 계산
      setNewComment({ 
        x: e.clientX, 
        y: e.clientY, 
        x_percent: e.pageX / document.documentElement.scrollWidth, 
        y_percent: e.pageY / document.documentElement.scrollHeight 
      });
    }
  };

  // 6. 댓글 DB 저장
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !message.trim() || !newComment) return;

    localStorage.setItem('feedback_author', author);

    const { error } = await supabase.from('prototype_comments').insert({
      author,
      message,
      x_percent: newComment.x_percent,
      y_percent: newComment.y_percent,
      page_path: pageId,
      is_resolved: false
    });

    if (error) {
      console.error('Save Error:', error);
      alert('댓글 저장에 실패했습니다.');
    } else {
      setNewComment(null);
      setMessage('');
      // 실시간 구독이 리스트를 갱신하지만, 즉각적인 반응을 위해 fetch 호출 가능
      fetchFeedbacks();
    }
  };

  const getPosition = (x, y) => {
    const formW = 320, formH = 260;
    const newX = x + formW > window.innerWidth ? window.innerWidth - formW - 20 : x;
    const newY = y + formH > window.innerHeight ? window.innerHeight - formH - 20 : y;
    return { left: newX, top: newY };
  }

  return (
    <div
      onClick={handleLayerClick}
      className={cn(
        "absolute inset-0 z-[9999]",
        isModeActive || lockedPinId ? "pointer-events-auto" : "pointer-events-none",
        isModeActive && "bg-blue-500/10 border-2 border-dashed border-blue-600"
      )}
      style={{ minHeight: '100vh' }}
    >
      {/* 기존 피드백 핀 렌더링 */}
      {!isHideComments && feedbacks.map((fb, index) => {
          const isLocked = lockedPinId === fb.id;
          // 💡 스마트 포지셔닝: y좌표가 상단 25% 미만이면 팝업을 아래로 보냄
          const isNearTop = fb.y_percent < 0.25;
          const createdDate = new Date(fb.created_at);
          const formattedDate = `${String(createdDate.getMonth() + 1).padStart(2, '0')}.${String(createdDate.getDate()).padStart(2, '0')}`;
          return (
            <div
              key={fb.id}
              className={cn(
                "qna-pin group absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto",
                isLocked ? "z-[10001]" : "z-[10000]"
              )}
              style={{ left: `${fb.x_percent * 100}%`, top: `${fb.y_percent * 100}%` }}
            >
              {/* 핀 아이콘 */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setLockedPinId(prevId => (prevId === fb.id ? null : fb.id));
                  if (newComment) setNewComment(null);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold shadow-lg ring-2 ring-white transition-all cursor-pointer hover:scale-110",
                  isLocked && "ring-4 ring-blue-400 scale-125"
                )}
              >
                {index + 1}
              </div>

              {/* 작성자 및 날짜 라벨 */}
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 w-max text-center pointer-events-none transition-opacity",
                isNearTop ? "top-full pt-2" : "bottom-full pb-2",
                isLocked && "opacity-0"
              )}>
                <div className="text-[10px] font-bold text-slate-700 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm">
                  {fb.author}
                  <span className="font-medium text-slate-500"> · {formattedDate}</span>
                </div>
              </div>

              {/* 팝업 창 */}
              <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                "qna-popup absolute left-1/2 -translate-x-1/2 w-72 rounded-lg bg-slate-800 p-4 text-sm text-white shadow-2xl transition-opacity",
                isLocked ? "opacity-100 pointer-events-auto" : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto",
                isNearTop ? "top-full mt-3" : "bottom-full mb-3" // 상단이면 아래로, 아니면 위로
              )}>
                <div className="flex justify-between items-start mb-2 border-b border-slate-700 pb-2">
                  <span className="font-bold text-blue-300">{fb.author}</span>
                  <span className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mb-4 whitespace-pre-wrap break-words leading-relaxed">{fb.message}</p>
                <button 
                  type="button"
                  onClick={(e) => handleResolve(e, fb.id)}
                  disabled={!!resolvingId}
                  className="w-full py-2 px-3 text-xs font-bold bg-green-600 hover:bg-green-700 rounded-md transition-all active:scale-95 text-white disabled:bg-slate-500"
                >
                  {resolvingId === fb.id ? '처리 중...' : '해결(완료)'}
                </button>
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent",
                  isNearTop 
                    ? "bottom-full border-b-8 border-b-slate-800" // 아래로 뜰 땐 화살표가 위로
                    : "top-full border-t-8 border-t-slate-800"    // 위로 뜰 땐 화살표가 아래로
                )}></div>
              </div>
            </div>
          );
        })
      }

      {/* 신규 댓글 입력 폼 */}
      {newComment && (
        <div
          className="feedback-form fixed w-80 rounded-xl bg-white shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 pointer-events-auto"
          style={getPosition(newComment.x, newComment.y)}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleCommentSubmit}>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">피드백 남기기</h3>
                <button type="button" onClick={() => setNewComment(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                  <X size={18} />
                </button>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 font-bold">내용 *</label>
                <textarea 
                  placeholder="의견을 입력하세요..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[100px] outline-none border" 
                  required 
                  autoFocus 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 font-bold">작성자 *</label>
                <input 
                  type="text" 
                  placeholder="이름 입력" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none border" 
                  required 
                />
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right rounded-b-xl border-t border-gray-100">
              <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center rounded-lg font-bold transition-all text-sm h-10 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-md" 
                disabled={!author.trim() || !message.trim()}
              >
                <Send size={14} className="mr-2" />
                피드백 저장하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
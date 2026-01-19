import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const FeedbackLayer = ({ isModeActive }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(null); // { x, y }
  const [formData, setFormData] = useState({ author: '', message: '' });
  const pagePath = window.location.pathname;

  // 1. 초기 데이터 불러오기 (해결되지 않은 것만)
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('prototype_comments')
      .select('*')
      .eq('page_path', pagePath)
      .eq('is_resolved', false); // 해결된 것은 가져오지 않음
    
    if (!error) setComments(data);
  };

  useEffect(() => {
    fetchComments();

    // 2. 실시간 구독 설정
    const channel = supabase
      .channel('realtime_feedback')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prototype_comments' 
      }, () => {
        fetchComments(); // 변경 발생 시 리로드
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [pagePath]);

  // 화면 클릭 시 좌표 계산
  const handleScreenClick = (e) => {
    if (!isModeActive || newComment) return;

    const xPercent = (e.clientX / window.innerWidth) * 100;
    const yPercent = (e.clientY / window.innerHeight) * 100;

    setNewComment({ x: xPercent, y: yPercent });
  };

  // 댓글 저장
  const saveComment = async () => {
    if (!formData.author || !formData.message) return alert('이름과 메시지를 입력하세요.');

    const { error } = await supabase.from('prototype_comments').insert([
      {
        page_path: pagePath,
        x_percent: newComment.x,
        y_percent: newComment.y,
        author: formData.author,
        message: formData.message,
      }
    ]);

    if (!error) {
      setNewComment(null);
      setFormData({ ...formData, message: '' });
    }
  };

  // 해결(완료) 처리
  const resolveComment = async (id) => {
    const { error } = await supabase
      .from('prototype_comments')
      .update({ is_resolved: true })
      .eq('id', id);
    
    if (error) alert('처리 중 오류가 발생했습니다.');
  };

  if (!isModeActive && comments.length === 0) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] ${isModeActive ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onClick={handleScreenClick}
    >
      {/* 기존 댓글 핀들 */}
      {comments.map((c) => (
        <div 
          key={c.id}
          className="absolute group pointer-events-auto"
          style={{ left: `${c.x_percent}%`, top: `${c.y_percent}%` }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-help transition-transform hover:scale-125" />
          
          {/* 말풍선 툴팁 */}
          <div className="hidden group-hover:block absolute left-6 top-0 w-48 bg-white border rounded-lg shadow-xl p-3 z-10 text-sm">
            <div className="font-bold border-b pb-1 mb-1 flex justify-between items-center">
              <span>{c.author}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }}
                className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded hover:bg-green-200"
              >
                해결
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{c.message}</p>
          </div>
        </div>
      ))}

      {/* 새 댓글 입력창 */}
      {newComment && (
        <div 
          className="absolute pointer-events-auto bg-white border rounded-lg shadow-2xl p-4 w-64 z-20"
          style={{ left: `${newComment.x}%`, top: `${newComment.y}%` }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-xs font-bold mb-2">새 의견 남기기</h4>
          <input 
            className="w-full border rounded p-2 text-xs mb-2" 
            placeholder="이름"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
          />
          <textarea 
            className="w-full border rounded p-2 text-xs mb-3" 
            placeholder="내용을 입력하세요..."
            rows="3"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setNewComment(null)} className="text-xs text-gray-500 px-2">취소</button>
            <button onClick={saveComment} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded">저장</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackLayer;
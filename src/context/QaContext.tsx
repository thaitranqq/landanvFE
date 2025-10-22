/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react';

// Mock data structure based on your API doc
export interface QaItem {
  id: string;
  question: string;
  questionAuthor: string;
  answer?: string;
  answerAuthor?: string;
  createdAt: string;
}

interface QaContextType {
  fetchQuestions: (productId: number) => Promise<QaItem[]>;
  submitQuestion: (productId: number, question: string) => Promise<QaItem>;
}

const QaContext = createContext<QaContextType | undefined>(undefined);

// Mock initial data for Q&A
const mockQaData: { [productId: number]: QaItem[] } = {
  1: [
    { 
      id: 'qa1', 
      question: 'Sản phẩm này có dùng được cho da nhạy cảm không? Mình thấy có Poloxamer 184.', 
      questionAuthor: 'user123', 
      answer: 'Chào bạn, Poloxamer 184 là một chất làm sạch nhẹ nhàng và thường an toàn cho da nhạy cảm. Tuy nhiên, bạn nên thử sản phẩm trên một vùng da nhỏ trước nhé!', 
      answerAuthor: 'LADANV Admin',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    }
  ]
};

export const QaProvider = ({ children }: { children: ReactNode }) => {

  const fetchQuestions = async (productId: number): Promise<QaItem[]> => {
    // In a real app, this would call: await api.get(`/qa/product/${productId}`);
    console.log(`Fetching Q&A for product ${productId}`);
    return new Promise(resolve => setTimeout(() => {
      resolve(mockQaData[productId] || []);
    }, 500));
  };

  const submitQuestion = async (productId: number, question: string): Promise<QaItem> => {
    // In a real app, this would call: await api.post(`/qa/product/${productId}`, { question });
    console.log(`Submitting question for product ${productId}: "${question}"`);
    const newQuestion: QaItem = {
      id: `qa${Date.now()}`,
      question,
      questionAuthor: 'Bạn', // Current user
      createdAt: new Date().toISOString(),
    };
    // We don't add it to the list here, as it needs moderation first.
    // The admin will answer, and then it will appear in the fetched list.
    alert('Câu hỏi của bạn đã được gửi và đang chờ duyệt. Cảm ơn bạn!');
    return new Promise(resolve => setTimeout(() => {
      resolve(newQuestion);
    }, 500));
  };

  return (
    <QaContext.Provider value={{ fetchQuestions, submitQuestion }}>
      {children}
    </QaContext.Provider>
  );
};

export const useQa = () => {
  const context = useContext(QaContext);
  if (context === undefined) {
    throw new Error('useQa must be used within a QaProvider');
  }
  return context;
};

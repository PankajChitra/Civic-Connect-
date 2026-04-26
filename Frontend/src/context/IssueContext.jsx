import React, { createContext, useContext, useState, useCallback } from "react";
import { issueAPI } from "../services/api";

const IssueContext = createContext(null);

export function IssueProvider({ children }) {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchIssues = useCallback(async (params = {}) => {
    try {
      setLoading(true); setError("");
      const data = await issueAPI.getAll(params);
      setIssues(data.issues);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const addIssue     = (issue) => setIssues((p) => [issue, ...p]);

  const updateStatus = async (id, status, comment) => {
    const { issue } = await issueAPI.updateStatus(id, status, comment);
    setIssues((p) => p.map((i) => i._id === id ? issue : i));
  };

  const escalateIssue = async (id, reason) => {
    const { issue } = await issueAPI.escalate(id, reason);
    setIssues((p) => p.map((i) => i._id === id ? issue : i));
  };

  const assignIssue = async (id, adminId) => {
    const { issue } = await issueAPI.assign(id, adminId);
    setIssues((p) => p.map((i) => i._id === id ? issue : i));
  };

  const setPriority = async (id, priority) => {
    const { issue } = await issueAPI.setPriority(id, priority);
    setIssues((p) => p.map((i) => i._id === id ? issue : i));
  };

  const deleteIssue = async (id) => {
    await issueAPI.delete(id);
    setIssues((p) => p.filter((i) => i._id !== id));
  };

  const deleteAll = async () => {
    await issueAPI.deleteAll();
    setIssues([]);
  };

  return (
    <IssueContext.Provider value={{
      issues, loading, error,
      fetchIssues, addIssue,
      updateStatus, escalateIssue, assignIssue, setPriority,
      deleteIssue, deleteAll,
    }}>
      {children}
    </IssueContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useIssues = () => useContext(IssueContext);
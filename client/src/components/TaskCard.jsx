// TaskCard Component
// Displays individual task with priority and deadline

import { useState } from 'react';
import { motion } from 'framer-motion';

export const TaskCard = ({ task, index }) => {
  const [copied, setCopied] = useState(false);
  const priorityClass = `priority-${task.priority.toLowerCase()}`;

  const handleCopy = async () => {
    const taskText = `${task.task}\nAssignee: ${task.assignee}\nPriority: ${task.priority}\nDeadline: ${task.deadline}`;
    try {
      await navigator.clipboard.writeText(taskText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div 
      className={`card task-card priority-${task.priority.toLowerCase()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <h4 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '700',
            color: '#141413',
            flex: 1,
          }}>
            {task.task}
          </h4>
          <span className={`priority-badge ${priorityClass}`}>
            {task.priority}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: '#B0AEA5', fontSize: '0.85rem' }}>
              Assignee
            </p>
            <p style={{ margin: 0, color: '#141413', fontWeight: '500' }}>
              {task.assignee}
            </p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem', color: '#B0AEA5', fontSize: '0.85rem' }}>
              Deadline
            </p>
            <p style={{ margin: 0, color: '#141413', fontWeight: '500' }}>
              {task.deadline}
            </p>
          </div>
        </div>

        {task.reasoning && (
          <p style={{
            margin: '0.75rem 0 0',
            padding: '0.75rem',
            backgroundColor: '#FAF9F5',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            color: '#B0AEA5',
            borderLeft: '2px solid #E8E6DC',
          }}>
            💡 {task.reasoning}
          </p>
        )}
      </div>

      <button
        onClick={handleCopy}
        className={`copy-btn ${copied ? 'copied' : ''}`}
        title="Copy task details"
        aria-label={`Copy task: ${task.task}`}
        style={{ alignSelf: 'flex-start', marginLeft: '1rem' }}
      >
        {copied ? '✓' : '📋'}
      </button>
    </motion.div>
  );
};

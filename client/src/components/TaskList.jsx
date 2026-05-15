// TaskList Component
// Displays all extracted tasks

import { TaskCard } from './TaskCard';
import { motion } from 'framer-motion';

export const TaskList = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks extracted from the meeting.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 style={{
        margin: '2rem 0 1.5rem',
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#141413',
      }}>
        ✅ Action Items ({tasks.length})
      </h3>
      <div>
        {tasks.map((task, index) => (
          <TaskCard key={index} task={task} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

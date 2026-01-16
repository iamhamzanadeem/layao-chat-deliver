import { motion } from 'framer-motion';

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 },
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="flex justify-start">
      <div className="bg-chat-bot rounded-2xl rounded-tl-md px-4 py-3">
        <motion.div
          className="flex gap-1.5"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50"
              variants={dotVariants}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 0.4,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TypingIndicator;

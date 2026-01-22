import { motion } from 'framer-motion';
import { Clock, Bell, CheckCircle } from 'lucide-react';

interface ErrandSubmittedProps {
  orderNumber: string;
}

const ErrandSubmitted = ({ orderNumber }: ErrandSubmittedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg max-w-md text-white"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-8 h-8" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-center mb-2"
      >
        Request Submitted!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/80 text-sm mb-4"
      >
        Your errand request has been sent for approval
      </motion.p>

      {/* Order Number */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 rounded-lg p-3 text-center mb-4"
      >
        <p className="text-xs text-white/60 mb-1">Request Number</p>
        <p className="text-lg font-mono font-bold">{orderNumber}</p>
      </motion.div>

      {/* Status Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">Pending Approval</p>
            <p className="text-xs text-white/60">Admin will review your request</p>
          </div>
        </div>

        <div className="flex items-center gap-3 opacity-50">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">You'll be notified</p>
            <p className="text-xs text-white/60">When your request is approved</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ErrandSubmitted;

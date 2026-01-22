import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileText, Utensils, Package, Sparkles } from 'lucide-react';
import type { ErrandTaskType } from '@/types/errand';
import { ERRAND_TASK_TYPES } from '@/types/errand';

interface ErrandTaskTypeSelectorProps {
  onSelect: (type: ErrandTaskType) => void;
}

const TASK_ICONS: Record<ErrandTaskType, React.ElementType> = {
  document: FileText,
  restaurant: Utensils,
  package: Package,
  custom: Sparkles,
};

const ErrandTaskTypeSelector = ({ onSelect }: ErrandTaskTypeSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-sm border border-border max-w-md"
    >
      <h3 className="font-semibold text-foreground mb-3">
        What type of task do you need done?
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {ERRAND_TASK_TYPES.map((task, index) => {
          const Icon = TASK_ICONS[task.value];
          return (
            <motion.button
              key={task.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(task.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl',
                'bg-muted/50 hover:bg-primary/10 border border-transparent',
                'hover:border-primary/20 transition-all duration-200',
                'text-center group'
              )}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{task.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ErrandTaskTypeSelector;

import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export function Templates() {
  const { templates, removeTemplate } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Templates</h1>
        <p className="text-muted-foreground mt-1">Manage your frequently used label configurations.</p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No templates saved yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <motion.div 
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{template.labels.length} labels</p>
                </div>
                <button 
                  onClick={() => removeTemplate(template.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {template.labels.slice(0, 3).map((l, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground truncate max-w-full">
                    {l}
                  </span>
                ))}
                {template.labels.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-secondary rounded-md text-muted-foreground">
                    +{template.labels.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

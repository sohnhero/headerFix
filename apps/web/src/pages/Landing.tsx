import { motion } from 'framer-motion';
import { ArrowRight, Download, Link as LinkIcon, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto text-center space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center space-x-2 bg-secondary/50 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground border border-border">
          <span className="flex h-2 w-2 rounded-full bg-primary"></span>
          <span>v1.0 is now available</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          Fix ServiceNow <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
            Export Headers
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Automatically capture missing metric headers from Platform Analytics and inject them back into your Excel exports in seconds.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link 
          to="/dashboard"
          className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
        <a 
          href="#"
          className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium text-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors border border-border"
        >
          Install Chrome Extension
          <Download className="ml-2 w-4 h-4" />
        </a>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid sm:grid-cols-3 gap-8 w-full mt-16 pt-16 border-t border-border"
      >
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">1. Capture</h3>
          <p className="text-muted-foreground text-sm">The extension automatically reads the labels from ServiceNow when you export.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">2. Drop Excel</h3>
          <p className="text-muted-foreground text-sm">Drag and drop the broken .xlsx file into our dashboard.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">3. Download</h3>
          <p className="text-muted-foreground text-sm">Get the repaired workbook instantly with all formatting preserved.</p>
        </div>
      </motion.div>
    </div>
  );
}

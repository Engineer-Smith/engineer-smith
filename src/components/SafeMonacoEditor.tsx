import React, { useState, useEffect, useRef } from 'react';
import { Alert, Input, Spinner } from 'reactstrap';
import { AlertTriangle, Code } from 'lucide-react';
import MonacoErrorBoundary from './MonacoErrorBoundary';

// Lazy load Monaco Editor to avoid SSR issues
const Editor = React.lazy(() => import('@monaco-editor/react'));

interface SafeMonacoEditorProps {
  height?: string;
  language?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: any;
  onMount?: (editor: any, monaco: any) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const SafeMonacoEditor: React.FC<SafeMonacoEditorProps> = ({
  height = '400px',
  language = 'javascript',
  value = '',
  onChange,
  options = {},
  onMount,
  readOnly = false,
  placeholder = 'Write your code here...'
}) => {
  const [useTextarea, setUseTextarea] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate actual height when using percentage
  useEffect(() => {
    if (height === '100%' && containerRef.current) {
      const updateHeight = () => {
        const container = containerRef.current;
        if (container) {
          const parentHeight = container.offsetParent?.clientHeight || container.parentElement?.clientHeight;
          if (parentHeight && parentHeight > 0) {
            // Subtract some padding/border space
            const calculatedHeight = Math.max(300, parentHeight - 10);
            setEditorHeight(`${calculatedHeight}px`);
          } else {
            // Fallback to a reasonable minimum
            setEditorHeight('400px');
          }
        }
      };

      // Initial calculation
      updateHeight();

      // Set up resize observer
      const resizeObserver = new ResizeObserver(updateHeight);
      if (containerRef.current?.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
      }

      // Fallback with timeout
      const timeoutId = setTimeout(updateHeight, 100);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
      };
    } else {
      setEditorHeight(height);
    }
  }, [height]);

  useEffect(() => {
    // Set a timeout to fallback to textarea if Monaco takes too long
    timeoutRef.current = window.setTimeout(() => {
      setLoadError('Editor is taking too long to load');
      setUseTextarea(true);
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(null);
    
    try {
      // Force layout after mount
      setTimeout(() => {
        editor.layout();
      }, 100);
      
      onMount?.(editor, monaco);
    } catch (error) {
      console.warn('Monaco onMount error:', error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    try {
      onChange?.(value);
    } catch (error) {
      console.warn('Monaco onChange error:', error);
    }
  };

  // Fallback to textarea
  if (useTextarea || loadError) {
    return (
      <div ref={containerRef}>
        {loadError && (
          <Alert color="warning" className="mb-2">
            <AlertTriangle size={16} className="me-2" />
            {loadError} - Using text area fallback
          </Alert>
        )}
        <Input
          type="textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          style={{ 
            height: editorHeight, 
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.4'
          }}
          className="border"
        />
      </div>
    );
  }

  const defaultOptions = {
    fontSize: 14,
    fontFamily: 'monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    padding: { top: 10 },
    automaticLayout: true,
    theme: 'vs-light',
    readOnly,
    wordWrap: 'on',
    acceptSuggestionOnCommitCharacter: false,
    acceptSuggestionOnEnter: 'off',
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    parameterHints: { enabled: false },
    contextmenu: false,
    ...options
  };

  return (
    <MonacoErrorBoundary
      fallback={
        <div>
          <Alert color="warning" className="mb-2">
            <AlertTriangle size={16} className="me-2" />
            Code editor crashed - Using text area fallback
          </Alert>
          <Input
            type="textarea"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={readOnly}
            placeholder={placeholder}
            style={{ 
              height: editorHeight, 
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
            className="border"
          />
        </div>
      }
    >
      <div className="position-relative" ref={containerRef} style={{ height: height }}>
        {isLoading && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light border rounded"
            style={{ zIndex: 10, height: editorHeight }}
          >
            <div className="text-center">
              <Spinner color="primary" className="mb-2" />
              <div className="small text-muted">Loading code editor...</div>
            </div>
          </div>
        )}
        
        <div className="border rounded" style={{ height: editorHeight, width: '100%' }}>
          <Editor
            height={editorHeight}
            language={language}
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={defaultOptions}
            loading={
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <Code size={24} className="text-muted mb-2" />
                  <div className="small text-muted">Initializing editor...</div>
                </div>
              </div>
            }
            beforeMount={(monaco) => {
              // Configure Monaco before mounting
              try {
                monaco.editor.defineTheme('custom-theme', {
                  base: 'vs',
                  inherit: true,
                  rules: [],
                  colors: {}
                });
              } catch (error) {
                console.warn('Monaco theme setup error:', error);
              }
            }}
            onValidate={(markers) => {
              // Handle validation markers if needed
              if (markers.length > 0) {
                console.debug('Monaco validation markers:', markers);
              }
            }}
          />
        </div>
      </div>
    </MonacoErrorBoundary>
  );
};

export default SafeMonacoEditor;
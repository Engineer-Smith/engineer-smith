// src/components/QuestionCreation/components/PromptGenerationModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  Spinner,
  UncontrolledTooltip
} from 'reactstrap';
import {
  Zap,
  Copy,
  Download,
  RefreshCw,
  X,
  CheckCircle,
  Code,
  HelpCircle,
  Lightbulb,
  FileText
} from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const PromptGenerationModal: React.FC = () => {
  const {
    state,
    dispatch,
    generatePrompt
  } = useQuestionCreation();

  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [promptType, setPromptType] = useState<'testcases' | 'content' | 'custom'>('testcases');

  const {
    promptGeneration,
    questionData,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType
  } = state;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_PROMPT_MODAL' });
    setCustomPrompt('');
    setCopied(false);
  };

  const handleCopyToClipboard = async () => {
    if (!promptGeneration.generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(promptGeneration.generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadPrompt = () => {
    if (!promptGeneration.generatedPrompt) return;

    const blob = new Blob([promptGeneration.generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionData.title || 'question'}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegeneratePrompt = () => {
    generatePrompt();
  };

  const handleGenerateCustomPrompt = () => {
    if (!customPrompt.trim()) return;

    // Generate prompt based on custom input
    const prompt = createCustomPrompt(customPrompt);
    dispatch({ type: 'SET_GENERATED_PROMPT', payload: prompt });
  };

  const createCustomPrompt = (userInput: string): string => {
    const { title, description, codeConfig } = questionData;
    
    return `Custom AI Prompt for ${selectedQuestionType} Question:

Question Context:
- Title: ${title || 'Untitled Question'}
- Language: ${selectedLanguage}
- Category: ${selectedCategory}
- Description: ${description || 'No description provided'}
${codeConfig?.entryFunction ? `- Function: ${codeConfig.entryFunction}` : ''}

User Request:
${userInput}

Please provide detailed assistance based on the question context and user request above.`;
  };

  const getPromptTypeInfo = () => {
    switch (promptType) {
      case 'testcases':
        return {
          title: 'Test Cases Generator',
          description: 'Generate comprehensive test cases for your code question',
          icon: Code,
          color: 'primary'
        };
      case 'content':
        return {
          title: 'Content Assistant',
          description: 'Get help with question content, examples, and explanations',
          icon: FileText,
          color: 'info'
        };
      case 'custom':
        return {
          title: 'Custom AI Request',
          description: 'Ask the AI anything about your question',
          icon: Lightbulb,
          color: 'warning'
        };
      default:
        return {
          title: 'AI Assistant',
          description: 'Get AI assistance with your question',
          icon: Zap,
          color: 'primary'
        };
    }
  };

  const promptTypeInfo = getPromptTypeInfo();

  return (
    <Modal 
      isOpen={promptGeneration.showModal} 
      toggle={handleClose}
      size="lg"
      backdrop="static"
    >
      <ModalHeader toggle={handleClose} className="border-bottom">
        <div className="d-flex align-items-center">
          <Zap size={20} className="text-primary me-2" />
          AI Prompt Generator
        </div>
      </ModalHeader>

      <ModalBody>
        {/* Prompt Type Selection */}
        <div className="mb-4">
          <Label className="fw-bold mb-2">What do you need help with?</Label>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              color={promptType === 'testcases' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setPromptType('testcases')}
            >
              <Code size={14} className="me-1" />
              Test Cases
            </Button>
            <Button
              color={promptType === 'content' ? 'info' : 'outline-info'}
              size="sm"
              onClick={() => setPromptType('content')}
            >
              <FileText size={14} className="me-1" />
              Content Help
            </Button>
            <Button
              color={promptType === 'custom' ? 'warning' : 'outline-warning'}
              size="sm"
              onClick={() => setPromptType('custom')}
            >
              <Lightbulb size={14} className="me-1" />
              Custom Request
            </Button>
          </div>
        </div>

        {/* Current Selection Info */}
        <Card className={`border-${promptTypeInfo.color} mb-4`}>
          <CardBody className="py-3">
            <div className="d-flex align-items-center">
              <promptTypeInfo.icon size={20} className={`text-${promptTypeInfo.color} me-2`} />
              <div>
                <h6 className="mb-0">{promptTypeInfo.title}</h6>
                <small className="text-muted">{promptTypeInfo.description}</small>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Custom Prompt Input */}
        {promptType === 'custom' && (
          <div className="mb-4">
            <FormGroup>
              <Label>
                Custom Request <span className="text-danger">*</span>
                <HelpCircle size={14} className="ms-1" id="custom-help" />
              </Label>
              <UncontrolledTooltip target="custom-help">
                Describe what specific help you need with your question. Be as detailed as possible.
              </UncontrolledTooltip>
              <Input
                type="textarea"
                rows={4}
                placeholder="e.g., Help me create edge cases for this sorting algorithm, suggest better variable names, create examples for this concept..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </FormGroup>
          </div>
        )}

        {/* Question Context */}
        <Card className="mb-4 bg-light">
          <CardBody className="py-3">
            <h6 className="mb-2">Question Context</h6>
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Badge color="primary">{selectedQuestionType}</Badge>
              <Badge color="info">{selectedLanguage}</Badge>
              <Badge color="secondary">{selectedCategory}</Badge>
            </div>
            <div className="small">
              <div className="mb-1"><strong>Title:</strong> {questionData.title || 'Not set'}</div>
              {questionData.codeConfig?.entryFunction && (
                <div><strong>Function:</strong> {questionData.codeConfig.entryFunction}</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Generated Prompt Display */}
        {promptGeneration.generatedPrompt ? (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Label className="fw-bold mb-0">Generated Prompt</Label>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  color="outline-secondary"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  color="outline-secondary"
                  onClick={handleDownloadPrompt}
                >
                  <Download size={14} className="me-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  color="outline-primary"
                  onClick={handleRegeneratePrompt}
                  disabled={promptGeneration.isGenerating}
                >
                  <RefreshCw size={14} className="me-1" />
                  Regenerate
                </Button>
              </div>
            </div>
            
            <Card className="border">
              <CardBody>
                <pre className="mb-0 small" style={{ 
                  whiteSpace: 'pre-wrap', 
                  maxHeight: '300px', 
                  overflow: 'auto',
                  fontFamily: 'inherit'
                }}>
                  {promptGeneration.generatedPrompt}
                </pre>
              </CardBody>
            </Card>

            <Alert color="info" className="mt-3 mb-0">
              <HelpCircle size={14} className="me-1" />
              Copy this prompt and paste it into your preferred AI tool (ChatGPT, Claude, etc.) 
              to get assistance with your question.
            </Alert>
          </div>
        ) : (
          <div className="text-center py-4">
            {promptGeneration.isGenerating ? (
              <div>
                <Spinner color="primary" className="mb-2" />
                <div className="small text-muted">Generating AI prompt...</div>
              </div>
            ) : (
              <div className="text-muted">
                <Zap size={32} className="mb-2 opacity-50" />
                <div>Click "Generate Prompt" to create an AI prompt based on your question</div>
              </div>
            )}
          </div>
        )}

        {/* Usage Tips */}
        {!promptGeneration.generatedPrompt && !promptGeneration.isGenerating && (
          <Card className="border-warning">
            <CardBody>
              <h6 className="text-warning mb-2">How to use AI prompts:</h6>
              <ul className="small mb-0">
                <li>Copy the generated prompt to your clipboard</li>
                <li>Open your preferred AI tool (ChatGPT, Claude, Gemini, etc.)</li>
                <li>Paste the prompt and get instant assistance</li>
                <li>Use the AI's suggestions to improve your question</li>
              </ul>
            </CardBody>
          </Card>
        )}
      </ModalBody>

      <ModalFooter className="border-top">
        <div className="d-flex justify-content-between w-100">
          <div className="small text-muted d-flex align-items-center">
            <Lightbulb size={14} className="me-1" />
            AI prompts help you create better questions faster
          </div>
          <div className="d-flex gap-2">
            <Button 
              color="secondary" 
              outline 
              onClick={handleClose}
            >
              <X size={14} className="me-1" />
              Close
            </Button>
            {!promptGeneration.generatedPrompt && (
              <Button 
                color="primary"
                onClick={promptType === 'custom' ? handleGenerateCustomPrompt : handleRegeneratePrompt}
                disabled={promptGeneration.isGenerating || (promptType === 'custom' && !customPrompt.trim())}
              >
                {promptGeneration.isGenerating ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={14} className="me-1" />
                    Generate Prompt
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default PromptGenerationModal;
import React, { useState, useMemo } from 'react';
import { Badge, Input, FormText } from 'reactstrap';
import { X, Search } from 'lucide-react';

interface TagsSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
  selectedLanguage?: string;
  selectedCategory?: string;
}

const TagsSelector: React.FC<TagsSelectorProps> = ({
  selectedTags,
  availableTags,
  onTagsChange,
  selectedLanguage,
  selectedCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tags based on language and category context
  const relevantTags = useMemo(() => {
    let filtered = [...availableTags];

    // Filter based on language
    if (selectedLanguage) {
      const languageRelevantTags = new Set([
        selectedLanguage,
        // Add language-specific tags
        ...(selectedLanguage === 'javascript' ? ['dom', 'events', 'async-programming', 'promises', 'async-await', 'es6', 'closures', 'scope', 'hoisting'] : []),
        ...(selectedLanguage === 'css' ? ['flexbox', 'grid', 'responsive-design'] : []),
        ...(selectedLanguage === 'html' ? ['dom', 'events'] : []),
        ...(selectedLanguage === 'react' ? ['components', 'hooks', 'state-management', 'props', 'context-api', 'redux', 'react-router', 'jsx', 'virtual-dom'] : []),
        ...(selectedLanguage === 'reactNative' ? ['native-components', 'navigation', 'mobile-development'] : []),
        ...(selectedLanguage === 'flutter' ? ['widgets', 'state-management-flutter', 'navigation-flutter', 'ui-components', 'mobile-development'] : []),
        ...(selectedLanguage === 'express' ? ['nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization', 'jwt', 'express-middleware'] : []),
        ...(selectedLanguage === 'sql' ? ['queries', 'joins', 'indexes', 'transactions', 'database-design', 'normalization'] : []),
        ...(selectedLanguage === 'python' ? ['functions', 'classes', 'modules', 'list-comprehensions', 'decorators', 'generators', 'python-data-structures'] : []),
        ...(selectedLanguage === 'typescript' ? ['typescript'] : []),
        ...(selectedLanguage === 'dart' ? ['dart'] : []),
        // General programming tags
        'variables', 'arrays', 'objects', 'loops', 'conditionals', 'algorithms', 'data-structures', 'error-handling', 'testing'
      ]);

      filtered = filtered.filter(tag => languageRelevantTags.has(tag));
    }

    // Filter based on category
    if (selectedCategory) {
      if (selectedCategory === 'ui') {
        const uiTags = ['flexbox', 'grid', 'responsive-design', 'components', 'widgets', 'ui-components', 'native-components', 'virtual-dom'];
        filtered = filtered.filter(tag => uiTags.includes(tag) || !['algorithms', 'data-structures', 'queries', 'joins'].includes(tag));
      } else if (selectedCategory === 'logic') {
        const logicTags = ['algorithms', 'data-structures', 'functions', 'loops', 'conditionals', 'variables', 'arrays', 'objects'];
        filtered = [...new Set([...filtered.filter(tag => logicTags.includes(tag)), ...filtered])];
      } else if (selectedCategory === 'syntax') {
        const syntaxTags = ['variables', 'functions', 'classes', 'modules', 'error-handling', 'testing'];
        filtered = [...new Set([...filtered.filter(tag => syntaxTags.includes(tag)), ...filtered])];
      }
    }

    return filtered.sort();
  }, [availableTags, selectedLanguage, selectedCategory]);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm) return relevantTags;
    return relevantTags.filter(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [relevantTags, searchTerm]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tags-selector">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <small className="text-muted d-block mb-2">Selected Tags:</small>
          <div className="d-flex gap-2 flex-wrap">
            {selectedTags.map(tag => (
              <Badge
                key={tag}
                color="primary"
                className="d-flex align-items-center gap-1"
              >
                {tag}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => handleTagRemove(tag)}
                  style={{ cursor: 'pointer' }}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="position-relative mb-3">
        <Search size={16} className="position-absolute" style={{ left: '8px', top: '8px', color: '#6c757d' }} />
        <Input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '32px' }}
        />
      </div>

      {/* Available Tags */}
      <div className="available-tags" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <div className="d-flex gap-2 flex-wrap">
          {filteredTags.map(tag => (
            <Badge
              key={tag}
              color={selectedTags.includes(tag) ? 'primary' : 'outline-secondary'}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
              style={{
                cursor: 'pointer',
                border: selectedTags.includes(tag) ? 'none' : '1px solid #dee2e6',
                backgroundColor: selectedTags.includes(tag) ? undefined : 'transparent',
                color: selectedTags.includes(tag) ? 'white' : '#6c757d'
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <FormText color="muted" className="mt-2">
        Tags help categorize your question and make it easier to find. 
        {selectedLanguage && ` Showing tags relevant to ${selectedLanguage}.`}
      </FormText>
    </div>
  );
};

export default TagsSelector;
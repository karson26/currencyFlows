import React, { useState, useEffect, useRef, useCallback } from 'react';

const COMMANDS = [
  { name: 'summarize', description: 'Summarize selected content' },
  { name: 'translate', description: 'Translate text' },
  { name: 'explain', description: 'Explain code or concepts' },
  { name: 'rewrite', description: 'Rewrite text' },
  { name: 'fix', description: 'Fix grammar and spelling' },
  { name: 'code', description: 'Generate code' },
  { name: 'review', description: 'Code review' },
  { name: 'test', description: 'Generate test cases' },
  { name: 'brainstorm', description: 'Brainstorm ideas' },
  { name: 'outline', description: 'Create an outline' },
];

function SlashInput() {
  const [showCommands, setShowCommands] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const optionRefs = useRef([]);

  const getTextContent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return '';
    return editor.textContent || '';
  }, []);

  const getBackslashIndex = useCallback(() => {
    const text = getTextContent();
    return text.indexOf('\\');
  }, [getTextContent]);

  useEffect(() => {
    const handleDocumentKeyDown = (e) => {
      const editor = editorRef.current;
      if (!editor) return;

      if (e.key === '\\') {
        const selection = window.getSelection();
        const isFocused = containerRef.current?.contains(selection?.anchorNode);

        if (!isFocused) {
          e.preventDefault();
          editor.focus();
          const range = selection?.getRangeAt(0);
          if (range) {
            range.collapse(false);
          }
          document.execCommand('insertText', false, '\\');
          setShowCommands(true);
          setSelectedIndex(-1);
        }
      }
    };

    const handleDocumentClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCommands(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && showCommands) {
      optionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, showCommands]);

  const filteredCommands = COMMANDS.filter(cmd => {
    const text = getTextContent();
    const backslashIndex = text.indexOf('\\');
    if (backslashIndex === -1) return false;
    const searchText = text.slice(backslashIndex + 1).toLowerCase();
    if (!searchText) return true;
    return cmd.name.toLowerCase().includes(searchText);
  });

  const insertTag = (command) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const backslashIndex = getBackslashIndex();

    if (backslashIndex === -1) return;

    editor.focus();

    const backslashTextNode = Array.from(editor.childNodes).find(
      node => node.nodeType === Node.TEXT_NODE && node.textContent.includes('\\')
    );

    if (!backslashTextNode) return;

    const backslashOffsetInNode = backslashTextNode.textContent.indexOf('\\');

    const deleteRange = document.createRange();
    deleteRange.setStart(backslashTextNode, backslashOffsetInNode);
    deleteRange.setEnd(range.startContainer, range.startOffset);
    deleteRange.deleteContents();

    const commandSpan = document.createElement('span');
    commandSpan.className = 'command-tag';
    commandSpan.textContent = command.name;
    commandSpan.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 14px;
      margin: 0 2px;
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 4px;
      font-size: 12px;
      color: #666;
    `;
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      const tagSpan = deleteBtn.parentElement;
      tagSpan.remove();
    };
    commandSpan.appendChild(deleteBtn);

    const insertRange = selection.getRangeAt(0);
    insertRange.insertNode(commandSpan);

    const spaceNode = document.createTextNode(' ');
    commandSpan.parentNode.insertBefore(spaceNode, commandSpan.nextSibling);

    const newRange = document.createRange();
    newRange.setStartAfter(spaceNode);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setShowCommands(false);
    setSelectedIndex(-1);
  };

  const handleEditorInput = () => {
    const text = getTextContent();
    const hasBackslash = text.includes('\\');
    setShowCommands(hasBackslash);
    if (hasBackslash) {
      setSelectedIndex(-1);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;

      if (container.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
        const prevSibling = container.previousElementSibling;
        if (prevSibling?.classList.contains('command-tag')) {
          e.preventDefault();
          const textNode = document.createTextNode(prevSibling.textContent.replace('×', ''));
          prevSibling.parentNode.replaceChild(textNode, prevSibling);
        }
      }
    }

    if (!showCommands) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const command = filteredCommands[selectedIndex];
      insertTag(command);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowCommands(false);
      setSelectedIndex(-1);
    }
  };

  const handleCommandClick = (command) => {
    insertTag(command);
  };

  return (
    <div>
      <div
        ref={containerRef}
        onClick={() => editorRef.current?.focus()}
        style={{
          position: 'relative',
          marginTop: '20px',
          width: '400px',
          minHeight: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onKeyDown={handleEditorKeyDown}
          style={{
            outline: 'none',
            minHeight: '24px',
            display: 'inline',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          data-placeholder="输入反斜杠 \ 查看命令..."
        />
        {showCommands && filteredCommands.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            border: '1px solid #ccc',
            background: 'white',
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginTop: '4px',
            borderRadius: '4px'
          }}>
            {filteredCommands.map((cmd, index) => (
              <div
                ref={el => optionRefs.current[index] = el}
                key={cmd.name}
                onClick={() => handleCommandClick(cmd)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: index === selectedIndex ? '#e6f7ff' : 'white',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <strong>{cmd.name}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {cmd.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        [contenteditable] .command-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #e6f7ff;
          border: 1px solid #91d5ff;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 14px;
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
}

export default SlashInput;
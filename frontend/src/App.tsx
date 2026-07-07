import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Client } from '@stomp/stompjs';
import { Play, Terminal, Share2, Check, FileText, Code2, PenTool, UserCog, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

const USER_ID = "user-" + Math.floor(Math.random() * 10000);

function App() {
  const [roomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) return room;
    // Auto-generate secure UUID for new rooms
    const newRoom = crypto.randomUUID();
    window.history.replaceState({}, '', `?room=${newRoom}`);
    return newRoom;
  });
  const [role, setRole] = useState<'candidate' | 'interviewer'>('candidate');
  const [language, setLanguage] = useState("python");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'notes'>('problem');
  const [problem, setProblem] = useState('');
  const [notes, setNotes] = useState('');
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState("World");
  const [output, setOutput] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const editorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const problemTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decorationsRef = useRef<any>(null);
  const roleRef = useRef(role);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);
  const remoteCursorRef = useRef<{line: number, col: number} | null>(null);
  
  // Prevent broadcasting changes that came from the network
  const isIncomingUpdate = useRef(false);
  const isIncomingNotesUpdate = useRef(false);
  const isIncomingProblemUpdate = useRef(false);

  useEffect(() => {
    // Disconnect previous client if it exists
    if (stompClient.current) {
      stompClient.current.deactivate();
    }

    // Fetch initial state first
    fetch(`http://localhost:8080/api/room/${roomId}`)
      .then(res => res.json())
      .then(data => {
        setCode(data.content);
        if (data.notes) setNotes(data.notes);
        if (data.problem) setProblem(data.problem);
        if (data.language) setLanguage(data.language);
        
        // Then connect WebSocket for future updates
        const client = new Client({
          brokerURL: 'ws://localhost:8080/ws-codesync',
          onConnect: () => {
        setConnected(true);
        // Subscribe to the specific room's topic
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const body = JSON.parse(message.body);
          if (body.senderId !== USER_ID) {
            if (body.type === 'CODE_UPDATE') {
              isIncomingUpdate.current = true;
              setCode(body.content);
              if (body.language) {
                setLanguage(body.language);
              }
              setTimeout(() => {
                if (decorationsRef.current && remoteCursorRef.current) {
                  decorationsRef.current.set([{
                    range: {
                      startLineNumber: remoteCursorRef.current.line,
                      startColumn: remoteCursorRef.current.col,
                      endLineNumber: remoteCursorRef.current.line,
                      endColumn: remoteCursorRef.current.col
                    },
                    options: { className: 'remote-cursor', isWholeLine: false, hoverMessage: { value: 'Candidate' } }
                  }]);
                }
              }, 100);
            } else if (body.type === 'NOTES_UPDATE') {
              isIncomingNotesUpdate.current = true;
              setNotes(body.content);
            } else if (body.type === 'PROBLEM_UPDATE') {
              isIncomingProblemUpdate.current = true;
              setProblem(body.content);
            } else if (body.type === 'CURSOR_UPDATE' && roleRef.current === 'interviewer') {
              remoteCursorRef.current = { line: body.cursorLine, col: body.cursorColumn };
              if (decorationsRef.current) {
                decorationsRef.current.set([{
                  range: {
                    startLineNumber: body.cursorLine,
                    startColumn: body.cursorColumn,
                    endLineNumber: body.cursorLine,
                    endColumn: body.cursorColumn
                  },
                  options: { className: 'remote-cursor', isWholeLine: false, hoverMessage: { value: 'Candidate' } }
                }]);
              }
            } else if (body.type === 'LANGUAGE_UPDATE') {
              setLanguage(body.language);
            } else if (body.type === 'EXECUTION_RESULT') {
              setOutput(body.content);
            }
          } else if (body.senderId === 'SYSTEM' && body.type === 'EXECUTION_RESULT') {
             // System messages (execution results) are shown to everyone
             setOutput(body.content);
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });
    
    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
    
    }); // end fetch
  }, [roomId]); // Re-run effect when roomId changes

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    
    if (isIncomingUpdate.current) {
      isIncomingUpdate.current = false;
      return;
    }

    if (stompClient.current && stompClient.current.connected) {
      // 1. Broadcast instantly to other clients for zero-latency collaboration
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({
          roomId: roomId,
          content: value,
          senderId: USER_ID,
          type: 'CODE_UPDATE'
        })
      });

      // 2. Debounce the save operation to protect Redis from write spam
      if (editorTimeoutRef.current) clearTimeout(editorTimeoutRef.current);
      editorTimeoutRef.current = setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.publish({
            destination: '/app/editor.sync',
            body: JSON.stringify({
              roomId: roomId,
              content: value,
              senderId: USER_ID,
              type: 'CODE_SAVE'
            })
          });
        }
      }, 1000);
    }
  };

  const handleRunCode = () => {
    setOutput('Running...');
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({
          roomId: roomId,
          content: code,
          senderId: USER_ID,
          type: 'EXECUTION_REQUEST',
          input: stdin,
          language: language
        })
      });
    }
  };

  const handleShareRoom = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    
    // Broadcast the language change to other clients
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({
          roomId: roomId,
          senderId: USER_ID,
          type: 'LANGUAGE_UPDATE',
          language: newLang
        })
      });
    }

    const boilerplate = newLang === "cpp" 
      ? '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}'
      : 'name = input("Enter your name: ")\nprint(f"Hello, {name}!")';

    setCode(boilerplate);
    
    // Explicitly broadcast the boilerplate code because Monaco won't fire onChange 
    // if the editor is in read-only mode (e.g. for the interviewer)
    if (stompClient.current && stompClient.current.connected) {
      setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.publish({
            destination: '/app/editor.sync',
            body: JSON.stringify({
              roomId: roomId,
              content: boilerplate,
              senderId: USER_ID,
              type: 'CODE_UPDATE',
              language: newLang
            })
          });
        }
      }, 50); // Small delay prevents STOMP message dropping when sent back-to-back

      // Debounced save for the backend Redis
      if (editorTimeoutRef.current) clearTimeout(editorTimeoutRef.current);
      editorTimeoutRef.current = setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.publish({
            destination: '/app/editor.sync',
            body: JSON.stringify({ roomId, content: boilerplate, senderId: USER_ID, type: 'CODE_SAVE' })
          });
        }
      }, 1000);
    }
    
    setOutput('');
  };

  const handleEditorDidMount = (editor: any) => {
    decorationsRef.current = editor.createDecorationsCollection();

    editor.onDidChangeCursorPosition((e: any) => {
      // ONLY broadcast cursor if we are the candidate
      if (roleRef.current === 'candidate' && stompClient.current && stompClient.current.connected) {
        stompClient.current.publish({
          destination: '/app/editor.sync',
          body: JSON.stringify({
            roomId: roomId,
            senderId: USER_ID,
            type: 'CURSOR_UPDATE',
            role: 'candidate',
            cursorLine: e.position.lineNumber,
            cursorColumn: e.position.column
          })
        });
      }
    });
  };

  // When role changes, if we become an interviewer, clear our own broadcasted cursor from others by not sending it anymore
  // and clear any existing remote candidate cursor if we are the candidate.
  useEffect(() => {
    if (role === 'candidate') {
       if (decorationsRef.current) decorationsRef.current.clear();
    }
  }, [role]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    
    if (isIncomingNotesUpdate.current) {
      isIncomingNotesUpdate.current = false;
      return;
    }

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({ roomId, content: value, senderId: USER_ID, type: 'NOTES_UPDATE' })
      });

      if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
      notesTimeoutRef.current = setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.publish({
            destination: '/app/editor.sync',
            body: JSON.stringify({ roomId, content: value, senderId: USER_ID, type: 'NOTES_SAVE' })
          });
        }
      }, 1000);
    }
  };

  const handleProblemChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setProblem(value);
    
    if (isIncomingProblemUpdate.current) {
      isIncomingProblemUpdate.current = false;
      return;
    }

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({ roomId, content: value, senderId: USER_ID, type: 'PROBLEM_UPDATE' })
      });

      if (problemTimeoutRef.current) clearTimeout(problemTimeoutRef.current);
      problemTimeoutRef.current = setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.publish({
            destination: '/app/editor.sync',
            body: JSON.stringify({ roomId, content: value, senderId: USER_ID, type: 'PROBLEM_SAVE' })
          });
        }
      }, 1000);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0E1117] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161B22] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Terminal size={18} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">CodeSync</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="hidden sm:inline">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {/* Role Selector */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1">
             <button
               onClick={() => setRole('candidate')}
               className={`text-xs px-2 md:px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${role === 'candidate' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-gray-200'}`}
               title="Candidate"
             >
               <User size={14} /> <span className="hidden lg:inline">Candidate</span>
             </button>
             <button
               onClick={() => setRole('interviewer')}
               className={`text-xs px-2 md:px-3 py-1.5 rounded flex items-center gap-2 transition-colors ${role === 'interviewer' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-gray-200'}`}
               title="Interviewer"
             >
               <UserCog size={14} /> <span className="hidden lg:inline">Interviewer</span>
             </button>
          </div>

          <button 
            onClick={handleShareRoom}
            className="text-xs flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-2 md:px-3 py-1.5 rounded transition-colors shrink-0 whitespace-nowrap"
            title="Copy Invite Link"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
            <span className="hidden md:inline">Share Invite Link</span>
          </button>
          
          <div className="flex items-center ml-2 bg-white/5 border border-white/10 rounded-md">
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-gray-300 text-xs px-3 py-1.5 focus:outline-none appearance-none cursor-pointer hover:bg-white/5"
            >
              <option value="python" className="bg-[#161B22]">Python 3</option>
              <option value="cpp" className="bg-[#161B22]">C++ (g++)</option>
            </select>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunCode}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-medium px-3 md:px-4 py-1.5 rounded-md transition-colors shrink-0 whitespace-nowrap h-[32px]"
            title="Run Code"
          >
            <Play size={16} />
            <span className="hidden md:inline">Run Code</span>
          </motion.button>
        </div>
      </header>

      {/* Main Workspace - Drag & Drop IDE Layout */}
      <main className="flex-1 flex overflow-hidden">
        <PanelGroup orientation="horizontal">
          
          {/* Left Column: Problem & Notes Tabs */}
          <Panel defaultSize={40} minSize={20} collapsible className="flex flex-col bg-[#0E1117]">
            {/* Tabs */}
            <div className="flex items-center bg-[#161B22] border-b border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('problem')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'problem' ? 'border-blue-500 text-white bg-[#0d1117]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <FileText size={16} /> Problem Description
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notes' ? 'border-blue-500 text-white bg-[#0d1117]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <PenTool size={16} /> Interview Notes
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 relative overflow-hidden">
              {activeTab === 'problem' ? (
                <textarea
                  value={problem}
                  onChange={handleProblemChange}
                  placeholder={role === 'interviewer' ? "Paste problem description here... (Synced in real-time)" : "Waiting for interviewer to paste problem..."}
                  className="absolute inset-0 w-full h-full bg-[#0E1117] text-gray-300 p-6 focus:outline-none resize-none font-sans"
                  readOnly={role === 'candidate'}
                />
              ) : (
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Type collaborative interview notes here... (Synced in real-time)"
                  className="absolute inset-0 w-full h-full bg-[#0E1117] text-gray-300 p-6 focus:outline-none resize-none font-sans"
                />
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#161B22] hover:bg-blue-500/50 cursor-col-resize transition-colors border-x border-white/5" />

          {/* Right Column: Code & Execution */}
          <Panel minSize={30}>
            <PanelGroup orientation="vertical">
              
              {/* Editor Panel (Top Half) */}
              <Panel defaultSize={70} minSize={30} className="flex flex-col bg-[#0d1117]">
                <div className="px-4 py-2 text-xs font-mono text-gray-400 bg-[#161B22] border-b border-white/5 flex items-center gap-2 shrink-0">
                  <Code2 size={14} /> main.{language === 'python' ? 'py' : 'cpp'}
                  {role === 'interviewer' && (
                    <span className="ml-auto text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      Interviewer Mode (Cursor Hidden)
                    </span>
                  )}
                </div>
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'Fira Code', monospace",
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      readOnly: role === 'interviewer',
                    }}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-[#161B22] hover:bg-blue-500/50 cursor-row-resize transition-colors border-y border-white/5" />

              {/* Output Panel (Bottom Half) */}
              <Panel defaultSize={30} minSize={10} collapsible className="flex flex-col bg-[#161B22]">
                <div className="flex items-center px-4 py-2 bg-[#0d1117] border-b border-white/10 shadow-sm z-10 text-sm font-semibold text-gray-300 gap-2 shrink-0 h-[40px]">
                  <Terminal size={14} className="text-gray-400" />
                  Execution Console
                </div>
                
                <div className="flex flex-row flex-1 min-h-0">
                  {/* Standard Input Area */}
                  <div className="w-[30%] flex flex-col shrink-0 border-r border-white/10 bg-[#0d1117]">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold px-3 py-1.5 flex items-center bg-[#161b22] shrink-0 border-b border-white/5">
                      Standard Input (stdin)
                    </div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      placeholder="Enter input here..."
                      className="flex-1 bg-transparent text-gray-300 font-mono text-xs p-3 focus:outline-none resize-none overflow-y-auto min-h-0"
                    />
                  </div>
                  
                  {/* Output Area */}
                  <div className="flex-1 flex flex-col min-h-0 bg-[#0a0c10]">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold px-3 py-1.5 flex items-center bg-[#161b22] shrink-0 border-b border-white/5">
                      Output
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 min-h-0">
                      <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap break-words">
                        {output || <span className="text-gray-600 italic">No output yet. Click 'Run Code' to execute.</span>}
                      </pre>
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );
}

export default App;

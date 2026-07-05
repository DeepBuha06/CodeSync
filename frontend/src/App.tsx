import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Client } from '@stomp/stompjs';
import { Play, Users, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const USER_ID = "user-" + Math.floor(Math.random() * 10000);

function App() {
  const [roomId, setRoomId] = useState("demo-room-123");
  const [roomInput, setRoomInput] = useState("demo-room-123");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState('name = input("Enter your name: ")\nprint(f"Hello, {name}!")');
  const [stdin, setStdin] = useState("World");
  const [output, setOutput] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  
  // Prevent broadcasting changes that came from the network
  const isIncomingUpdate = useRef(false);

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
      stompClient.current.publish({
        destination: '/app/editor.sync',
        body: JSON.stringify({
          roomId: roomId,
          content: value,
          senderId: USER_ID,
          type: 'CODE_UPDATE'
        })
      });
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

  const handleJoinRoom = () => {
    if (roomInput.trim() !== '') {
      setRoomId(roomInput.trim());
      setCode(''); // Optional: clear editor when changing rooms
      setOutput('');
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (newLang === "cpp") {
      setCode('#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}');
    } else {
      setCode('name = input("Enter your name: ")\nprint(f"Hello, {name}!")');
    }
    setOutput('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0E1117] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161B22]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Terminal size={18} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">CodeSync</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-1">
            <Users size={14} className="text-gray-400 ml-2 mr-1" />
            <input 
              type="text" 
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="bg-transparent text-gray-300 font-mono text-xs w-28 px-2 focus:outline-none"
              placeholder="Room ID"
            />
            <button 
              onClick={handleJoinRoom}
              className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded transition-colors"
            >
              Join
            </button>
          </div>
          
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
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-1.5 rounded-md transition-colors"
          >
            <Play size={16} />
            Run Code
          </motion.button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 text-xs font-mono text-gray-400 bg-[#0d1117] border-b border-white/5">
            main.{language === 'python' ? 'py' : 'cpp'}
          </div>
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </div>
        </div>

        {/* Output Panel */}
        <div className="w-[400px] flex flex-col bg-[#161B22] border-l border-white/10 relative overflow-hidden">
          {/* Output Header */}
          <div className="flex items-center px-4 py-2 bg-[#0d1117] border-b border-white/10 shadow-sm z-10 text-sm font-semibold text-gray-300 gap-2 shrink-0 h-[48px]">
            <Terminal size={16} className="text-gray-400" />
            Execution Console
          </div>
          
          <div className="flex flex-col flex-1 min-h-0">
            {/* Standard Input Area */}
            <div className="h-[35%] flex flex-col shrink-0 border-b border-white/10 bg-[#0d1117]">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-4 py-2 flex items-center bg-[#161b22] shrink-0">
                Standard Input (stdin)
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here (one per line)..."
                className="flex-1 bg-transparent text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none overflow-y-auto min-h-0"
              />
            </div>
            
            {/* Output Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#0a0c10]">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-4 py-2 flex items-center bg-[#161b22] shrink-0">
                Output
              </div>
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {output || <span className="text-gray-600 italic">No output yet. Click 'Run Code' to execute.</span>}
                </pre>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;

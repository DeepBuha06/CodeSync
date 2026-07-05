import grpc
from concurrent import futures
import sys
import io
import contextlib
import subprocess
import tempfile
import os

import execution_pb2
import execution_pb2_grpc

class CodeExecutionServiceServicer(execution_pb2_grpc.CodeExecutionServiceServicer):
    def ExecuteCode(self, request, context):
        code = request.code
        language = request.language

        if language.lower() == "python":
            try:
                # Run the code in a sandbox (subprocess)
                result = subprocess.run(
                    [sys.executable, "-c", request.code],
                    input=request.input,
                    capture_output=True,
                    text=True,
                    timeout=5.0  # 5 second timeout to prevent infinite loops
                )
                return execution_pb2.ExecutionResponse(
                    output=result.stdout,
                    error=result.stderr,
                    success=result.returncode == 0
                )
            except subprocess.TimeoutExpired:
                return execution_pb2.ExecutionResponse(
                    output="",
                    error="Execution timed out (5s limit)",
                    success=False
                )
            except Exception as e:
                return execution_pb2.ExecutionResponse(
                    output="",
                    error=str(e),
                    success=False
                )
                
        elif language.lower() in ["cpp", "c++"]:
            try:
                # Create a temporary directory to avoid collisions
                with tempfile.TemporaryDirectory() as temp_dir:
                    source_file = os.path.join(temp_dir, "main.cpp")
                    exe_file = os.path.join(temp_dir, "main.exe")
                    
                    with open(source_file, "w", encoding="utf-8") as f:
                        f.write(request.code)
                    
                    # Compile
                    compile_result = subprocess.run(
                        ["g++", source_file, "-o", exe_file],
                        capture_output=True,
                        text=True,
                        timeout=10.0
                    )
                    
                    if compile_result.returncode != 0:
                        return execution_pb2.ExecutionResponse(
                            output="",
                            error="Compilation Error:\n" + compile_result.stderr,
                            success=False
                        )
                    
                    # Run
                    run_result = subprocess.run(
                        [exe_file],
                        input=request.input,
                        capture_output=True,
                        text=True,
                        timeout=5.0
                    )
                    
                    return execution_pb2.ExecutionResponse(
                        output=run_result.stdout,
                        error=run_result.stderr,
                        success=run_result.returncode == 0
                    )
            except subprocess.TimeoutExpired:
                return execution_pb2.ExecutionResponse(
                    output="",
                    error="Execution timed out",
                    success=False
                )
            except Exception as e:
                return execution_pb2.ExecutionResponse(
                    output="",
                    error=str(e),
                    success=False
                )
        else:
            return execution_pb2.ExecutionResponse(
                output="",
                error=f"Language '{language}' is not supported in this sandbox.",
                success=False
            )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    execution_pb2_grpc.add_CodeExecutionServiceServicer_to_server(
        CodeExecutionServiceServicer(), server
    )
    server.add_insecure_port('[::]:50051')
    print("Execution Service starting on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()

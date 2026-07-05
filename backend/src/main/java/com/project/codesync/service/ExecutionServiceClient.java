package com.project.codesync.service;

import com.project.codesync.grpc.CodeExecutionServiceGrpc;
import com.project.codesync.grpc.ExecutionRequest;
import com.project.codesync.grpc.ExecutionResponse;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;

@Service
public class ExecutionServiceClient {

    private final ManagedChannel channel;
    private final CodeExecutionServiceGrpc.CodeExecutionServiceBlockingStub blockingStub;

    public ExecutionServiceClient() {
        // Connect to the Python gRPC server running on localhost:50051
        this.channel = ManagedChannelBuilder.forAddress("localhost", 50051)
                .usePlaintext() // No TLS for local dev
                .build();
        this.blockingStub = CodeExecutionServiceGrpc.newBlockingStub(channel);
    }

    public ExecutionResponse executeCode(String code, String language, String input) {
        ExecutionRequest request = ExecutionRequest.newBuilder()
                .setCode(code)
                .setLanguage(language)
                .setInput(input != null ? input : "")
                .build();
        
        return blockingStub.executeCode(request);
    }

    @PreDestroy
    public void shutdown() {
        if (channel != null) {
            channel.shutdown();
        }
    }
}

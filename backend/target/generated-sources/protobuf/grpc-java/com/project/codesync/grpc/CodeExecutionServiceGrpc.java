package com.project.codesync.grpc;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.62.2)",
    comments = "Source: execution.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class CodeExecutionServiceGrpc {

  private CodeExecutionServiceGrpc() {}

  public static final java.lang.String SERVICE_NAME = "execution.CodeExecutionService";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.project.codesync.grpc.ExecutionRequest,
      com.project.codesync.grpc.ExecutionResponse> getExecuteCodeMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "ExecuteCode",
      requestType = com.project.codesync.grpc.ExecutionRequest.class,
      responseType = com.project.codesync.grpc.ExecutionResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.project.codesync.grpc.ExecutionRequest,
      com.project.codesync.grpc.ExecutionResponse> getExecuteCodeMethod() {
    io.grpc.MethodDescriptor<com.project.codesync.grpc.ExecutionRequest, com.project.codesync.grpc.ExecutionResponse> getExecuteCodeMethod;
    if ((getExecuteCodeMethod = CodeExecutionServiceGrpc.getExecuteCodeMethod) == null) {
      synchronized (CodeExecutionServiceGrpc.class) {
        if ((getExecuteCodeMethod = CodeExecutionServiceGrpc.getExecuteCodeMethod) == null) {
          CodeExecutionServiceGrpc.getExecuteCodeMethod = getExecuteCodeMethod =
              io.grpc.MethodDescriptor.<com.project.codesync.grpc.ExecutionRequest, com.project.codesync.grpc.ExecutionResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "ExecuteCode"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.project.codesync.grpc.ExecutionRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.project.codesync.grpc.ExecutionResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CodeExecutionServiceMethodDescriptorSupplier("ExecuteCode"))
              .build();
        }
      }
    }
    return getExecuteCodeMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static CodeExecutionServiceStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceStub>() {
        @java.lang.Override
        public CodeExecutionServiceStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CodeExecutionServiceStub(channel, callOptions);
        }
      };
    return CodeExecutionServiceStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static CodeExecutionServiceBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceBlockingStub>() {
        @java.lang.Override
        public CodeExecutionServiceBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CodeExecutionServiceBlockingStub(channel, callOptions);
        }
      };
    return CodeExecutionServiceBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static CodeExecutionServiceFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CodeExecutionServiceFutureStub>() {
        @java.lang.Override
        public CodeExecutionServiceFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CodeExecutionServiceFutureStub(channel, callOptions);
        }
      };
    return CodeExecutionServiceFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void executeCode(com.project.codesync.grpc.ExecutionRequest request,
        io.grpc.stub.StreamObserver<com.project.codesync.grpc.ExecutionResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getExecuteCodeMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service CodeExecutionService.
   */
  public static abstract class CodeExecutionServiceImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return CodeExecutionServiceGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service CodeExecutionService.
   */
  public static final class CodeExecutionServiceStub
      extends io.grpc.stub.AbstractAsyncStub<CodeExecutionServiceStub> {
    private CodeExecutionServiceStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CodeExecutionServiceStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CodeExecutionServiceStub(channel, callOptions);
    }

    /**
     */
    public void executeCode(com.project.codesync.grpc.ExecutionRequest request,
        io.grpc.stub.StreamObserver<com.project.codesync.grpc.ExecutionResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getExecuteCodeMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service CodeExecutionService.
   */
  public static final class CodeExecutionServiceBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<CodeExecutionServiceBlockingStub> {
    private CodeExecutionServiceBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CodeExecutionServiceBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CodeExecutionServiceBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.project.codesync.grpc.ExecutionResponse executeCode(com.project.codesync.grpc.ExecutionRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getExecuteCodeMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service CodeExecutionService.
   */
  public static final class CodeExecutionServiceFutureStub
      extends io.grpc.stub.AbstractFutureStub<CodeExecutionServiceFutureStub> {
    private CodeExecutionServiceFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CodeExecutionServiceFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CodeExecutionServiceFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.project.codesync.grpc.ExecutionResponse> executeCode(
        com.project.codesync.grpc.ExecutionRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getExecuteCodeMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_EXECUTE_CODE = 0;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final AsyncService serviceImpl;
    private final int methodId;

    MethodHandlers(AsyncService serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_EXECUTE_CODE:
          serviceImpl.executeCode((com.project.codesync.grpc.ExecutionRequest) request,
              (io.grpc.stub.StreamObserver<com.project.codesync.grpc.ExecutionResponse>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  public static final io.grpc.ServerServiceDefinition bindService(AsyncService service) {
    return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
        .addMethod(
          getExecuteCodeMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.project.codesync.grpc.ExecutionRequest,
              com.project.codesync.grpc.ExecutionResponse>(
                service, METHODID_EXECUTE_CODE)))
        .build();
  }

  private static abstract class CodeExecutionServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    CodeExecutionServiceBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.project.codesync.grpc.ExecutionProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("CodeExecutionService");
    }
  }

  private static final class CodeExecutionServiceFileDescriptorSupplier
      extends CodeExecutionServiceBaseDescriptorSupplier {
    CodeExecutionServiceFileDescriptorSupplier() {}
  }

  private static final class CodeExecutionServiceMethodDescriptorSupplier
      extends CodeExecutionServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    CodeExecutionServiceMethodDescriptorSupplier(java.lang.String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (CodeExecutionServiceGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new CodeExecutionServiceFileDescriptorSupplier())
              .addMethod(getExecuteCodeMethod())
              .build();
        }
      }
    }
    return result;
  }
}

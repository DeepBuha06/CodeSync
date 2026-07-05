package com.project.codesync.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.codesync.model.CodeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisMessageSubscriber implements MessageListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // Deserialize the message from Redis
            String body = new String(message.getBody());
            // Since we used GenericJackson2JsonRedisSerializer, it might have type info or just be JSON
            // For simplicity in this demo, let's assume it's just raw JSON from the template string serializer
            // Let's clean the string if it has wrapping quotes (a quirk of some serializers)
            if (body.startsWith("\"") && body.endsWith("\"")) {
                body = body.substring(1, body.length() - 1).replace("\\\"", "\"");
            }
            
            CodeMessage codeMessage = objectMapper.readValue(body, CodeMessage.class);
            
            // Broadcast to the specific room's WebSocket topic
            messagingTemplate.convertAndSend("/topic/room/" + codeMessage.getRoomId(), codeMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

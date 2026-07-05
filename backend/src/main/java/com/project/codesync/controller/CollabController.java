package com.project.codesync.controller;

import com.project.codesync.grpc.ExecutionResponse;
import com.project.codesync.model.CodeMessage;
import com.project.codesync.service.ExecutionServiceClient;
import com.project.codesync.service.RedisMessagePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.HashMap;
import java.util.Map;

@Controller
@CrossOrigin(origins = "*")
public class CollabController {

    @Autowired
    private RedisMessagePublisher redisPublisher;

    @Autowired
    private ExecutionServiceClient executionService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/api/room/{roomId}")
    public ResponseEntity<Map<String, String>> getRoomState(@PathVariable String roomId) {
        String state = (String) redisTemplate.opsForValue().get("room_state:" + roomId);
        String notes = (String) redisTemplate.opsForValue().get("room_notes:" + roomId);
        String problem = (String) redisTemplate.opsForValue().get("room_problem:" + roomId);
        String language = (String) redisTemplate.opsForValue().get("room_language:" + roomId);
        
        Map<String, String> response = new HashMap<>();
        // If the room doesn't exist yet, provide a default template
        response.put("content", state != null ? state : "print(\"Hello CodeSync!\")");
        response.put("notes", notes != null ? notes : "Welcome to the interview workspace.\nStart taking notes here...");
        response.put("problem", problem != null ? problem : "## Sample Interview Problem\n\nWrite a function that reverses a string.\n\n**Example:**\n`reverse('hello') == 'olleh'`");
        response.put("language", language != null ? language : "python");
        
        return ResponseEntity.ok(response);
    }

    @MessageMapping("/editor.sync")
    public void syncCode(CodeMessage message) {
        if ("EXECUTION_REQUEST".equals(message.getType())) {
            // User requested to run the code
            String language = message.getLanguage() != null ? message.getLanguage() : "python";
            ExecutionResponse response = executionService.executeCode(message.getContent(), language, message.getInput());
            
            // Create a response message
            CodeMessage resultMessage = new CodeMessage(
                    message.getRoomId(),
                    response.getSuccess() ? response.getOutput() : response.getError(),
                    "SYSTEM",
                    "EXECUTION_RESULT",
                    null,
                    null,
                    null,
                    null,
                    null
            );
            // Broadcast the result to everyone in the room via Redis
            redisPublisher.publish(resultMessage);
        } else if ("CODE_SAVE".equals(message.getType())) {
            // Persist the debounced code state in Redis for late-joiners
            redisTemplate.opsForValue().set("room_state:" + message.getRoomId(), message.getContent());
        } else if ("NOTES_SAVE".equals(message.getType())) {
            // Persist the debounced notes state in Redis for late-joiners
            redisTemplate.opsForValue().set("room_notes:" + message.getRoomId(), message.getContent());
        } else if ("PROBLEM_SAVE".equals(message.getType())) {
            // Persist the debounced problem state in Redis for late-joiners
            redisTemplate.opsForValue().set("room_problem:" + message.getRoomId(), message.getContent());
        } else if ("LANGUAGE_UPDATE".equals(message.getType())) {
            // Persist the language in Redis immediately and broadcast
            redisTemplate.opsForValue().set("room_language:" + message.getRoomId(), message.getLanguage());
            redisPublisher.publish(message);
        } else {
            // CODE_UPDATE, NOTES_UPDATE, PROBLEM_UPDATE, CURSOR_UPDATE: Broadcast instantly
            redisPublisher.publish(message);
        }
    }
}

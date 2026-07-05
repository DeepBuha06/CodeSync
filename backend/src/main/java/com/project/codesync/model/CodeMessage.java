package com.project.codesync.model;

import java.io.Serializable;

public class CodeMessage implements Serializable {
    private String roomId;
    private String content;
    private String senderId;
    private String type;
    private String input; // Added for STDIN
    private String language; // e.g. "python" or "cpp"

    public CodeMessage() {}

    public CodeMessage(String roomId, String content, String senderId, String type, String input, String language) {
        this.roomId = roomId;
        this.content = content;
        this.senderId = senderId;
        this.type = type;
        this.input = input;
        this.language = language;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}

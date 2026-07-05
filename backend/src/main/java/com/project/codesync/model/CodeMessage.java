package com.project.codesync.model;

import java.io.Serializable;

public class CodeMessage implements Serializable {
    private String roomId;
    private String content;
    private String senderId;
    private String type;
    private String input; // Added for STDIN
    private String language; // e.g. "python" or "cpp"
    private Integer cursorLine;
    private Integer cursorColumn;
    private String role; // "candidate" or "interviewer"

    public CodeMessage() {}

    public CodeMessage(String roomId, String content, String senderId, String type, String input, String language, Integer cursorLine, Integer cursorColumn, String role) {
        this.roomId = roomId;
        this.content = content;
        this.senderId = senderId;
        this.type = type;
        this.input = input;
        this.language = language;
        this.cursorLine = cursorLine;
        this.cursorColumn = cursorColumn;
        this.role = role;
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

    public Integer getCursorLine() {
        return cursorLine;
    }

    public void setCursorLine(Integer cursorLine) {
        this.cursorLine = cursorLine;
    }

    public Integer getCursorColumn() {
        return cursorColumn;
    }

    public void setCursorColumn(Integer cursorColumn) {
        this.cursorColumn = cursorColumn;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

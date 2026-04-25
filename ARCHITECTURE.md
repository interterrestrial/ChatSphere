# ChatSphere Architecture Definitions

To support real-time chat, AI integration, and active caching, this document defines the relationships between all database entities and service modules within the system.

---
## Entity-Relationship (ER) Diagram

The ER Diagram outlines how MongoDB collections interface with one another.

```mermaid
erDiagram
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ CONVERSATION : "participates in"
    CONVERSATION ||--o{ MESSAGE : "contains"
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string username UK
        string googleId UK
        string password "nullable"
        boolean isUsernameSet
        datetime createdAt
        datetime updatedAt
    }
    
    CONVERSATION {
        ObjectId _id PK
        string title
        boolean isGroup
        ObjectId[] participants FK
        ObjectId lastMessage FK
        datetime createdAt
        datetime updatedAt
    }
    
    MESSAGE {
        ObjectId _id PK
        ObjectId conversationId FK
        ObjectId senderId FK
        string content
        boolean isRead
        datetime createdAt
    }
```

---

## UML Class Diagram

This diagram visualizes the backend structure connecting standard Mongoose schemas to dynamic, stateful layers like Redis caches and Socket networks.

```mermaid
classDiagram
    %% Core Models
    class User {
        +ObjectId _id
        +String name
        +String email
        +String username
        +String googleId
        +String password
        +Boolean isUsernameSet
        +Date createdAt
        +Date updatedAt
        +save()
        +findOne()
    }

    class Conversation {
        +ObjectId _id
        +String title
        +Boolean isGroup
        +ObjectId[] participants
        +ObjectId lastMessage
        +Date createdAt
        +Date updatedAt
        +addMessage()
        +getParticipants()
    }

    class Message {
        +ObjectId _id
        +ObjectId conversationId
        +ObjectId senderId
        +String content
        +Boolean isRead
        +Date createdAt
        +markAsRead()
    }

    %% Service Layers
    class SocketManager {
        +Server io
        +Map activeUsers
        +initialize(server)
        +handleConnection(socket)
        +sendMessage(data)
        +emitTyping(data)
    }

    class RedisCache {
        +RedisClient client
        +set(key, value)
        +get(key)
        +delete(key)
        +cacheActiveUser(userId, socketId)
        +removeActiveUser(userId)
    }

    class GeminiService {
        +generateSmartReply(messageContent)
        +summarizeConversation(messages)
    }

    %% Dependencies and Relationships
    User "1" -- "*" Conversation : participates
    Conversation "1" *-- "*" Message : contains
    SocketManager --> RedisCache : uses for presence
    GeminiService --> Message : analyzes context
    SocketManager --> Message : broadcasts
```

---

## Use Case Diagram

The Use Case Diagram defines the primary actions that end-users can perform within the system and shows how external services like Gemini AI are integrated into these interactions.

```mermaid
flowchart LR
    %% Actors
    ActorUser((User))
    ActorAI{{Gemini AI}}

    %% System Boundary
    subgraph ChatSphere [ChatSphere Platform]
        direction TB
        UC_Auth([User Registration & Login])
        UC_Chat([Send & Receive Messages])
        UC_Manage([Manage Conversations & Groups])
        UC_Presence([Real-time Presence & Typing])
        UC_Smart([Request Smart Replies])
        UC_Summary([Generate Conversation Summary])
    end

    %% Actor to Use Case relationships
    ActorUser --> UC_Auth
    ActorUser --> UC_Manage
    ActorUser --> UC_Presence
    ActorUser --> UC_Chat
    ActorUser --> UC_Smart
    ActorUser --> UC_Summary

    %% AI to Use Case relationships
    UC_Smart -.->|API Call| ActorAI
    UC_Summary -.->|API Call| ActorAI
```

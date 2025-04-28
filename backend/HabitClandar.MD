# 超级时间管理系统 API 文档

## 目录
1. [认证相关](#1-认证相关)
2. [日历功能](#2-日历功能)
3. [习惯管理](#3-习惯管理)
4. [AI助手聊天记录](#4-ai助手聊天记录)

## 1. 认证相关

### 1.1 用户注册
- **请求方式**: POST
- **请求URL**: `/api/v1/auth/register`
- **请求体**:
  ```json
  {
    "name": "张三",
    "email": "zhangsan@example.com",
    "password": "password123"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "680e83932f138ea792da9b5b",
        "name": "张三",
        "email": "zhangsan@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "注册成功"
  }
  ```
- **失败响应** (409 - 邮箱已存在):
  ```json
  {
    "success": false,
    "error": {
      "message": "邮箱已被注册"
    }
  }
  ```

### 1.2 用户登录
- **请求方式**: POST
- **请求URL**: `/api/v1/auth/login`
- **请求体**:
  ```json
  {
    "email": "zhangsan@example.com",
    "password": "password123"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "680e83932f138ea792da9b5b",
        "name": "张三",
        "email": "zhangsan@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "登录成功"
  }
  ```
- **失败响应** (401 - 凭据错误):
  ```json
  {
    "success": false,
    "error": {
      "message": "邮箱或密码不正确"
    }
  }
  ```

### 1.3 获取当前用户信息
- **请求方式**: GET
- **请求URL**: `/api/v1/auth/me`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680e83932f138ea792da9b5b",
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  }
  ```
- **失败响应** (401 - 未授权):
  ```json
  {
    "success": false,
    "error": {
      "message": "Authentication required"
    }
  }
  ```

## 2. 日历功能

### 2.1 获取日期任务
- **请求方式**: GET
- **请求URL**: `/api/v1/calendar/tasks`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求参数**:
  - `date`: ISO日期字符串 (可选，默认为当天)
  - `startDate`: ISO日期字符串 (可选，用于范围查询)
  - `endDate`: ISO日期字符串 (可选，用于范围查询)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "680eabd58f11c9bb14785aee",
        "name": "产品评审会议",
        "date": "2023-04-15T09:00:00.000Z",
        "timeRange": "09:00-10:30",
        "icon": "meeting-icon",
        "color": "#4a69bd",
        "completed": false,
        "userId": "680e83932f138ea792da9b5b"
      }
    ]
  }
  ```
- **失败响应** (400 - 无效日期):
  ```json
  {
    "success": false,
    "error": {
      "message": "无效的日期格式"
    }
  }
  ```

### 2.2 创建日历任务
- **请求方式**: POST
- **请求URL**: `/api/v1/calendar/tasks`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "产品评审会议",
    "date": "2023-04-15T09:00:00.000Z",
    "timeRange": "09:00-10:30",
    "icon": "meeting-icon",
    "color": "#4a69bd"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785aee",
      "name": "产品评审会议",
      "date": "2023-04-15T09:00:00.000Z",
      "timeRange": "09:00-10:30",
      "icon": "meeting-icon",
      "color": "#4a69bd",
      "completed": false,
      "userId": "680e83932f138ea792da9b5b",
      "createdAt": "2023-04-14T08:45:23.456Z",
      "updatedAt": "2023-04-14T08:45:23.456Z"
    },
    "message": "日历任务创建成功"
  }
  ```
- **失败响应** (400 - 验证失败):
  ```json
  {
    "success": false,
    "error": {
      "message": "Validation failed",
      "details": {
        "name": "任务名称不能为空"
      }
    }
  }
  ```

### 2.3 获取单个日历任务
- **请求方式**: GET
- **请求URL**: `/api/v1/calendar/tasks/:taskId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785aee",
      "name": "产品评审会议",
      "date": "2023-04-15T09:00:00.000Z",
      "timeRange": "09:00-10:30",
      "icon": "meeting-icon",
      "color": "#4a69bd",
      "completed": false,
      "userId": "680e83932f138ea792da9b5b"
    }
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该日历任务"
    }
  }
  ```

### 2.4 更新日历任务
- **请求方式**: PUT
- **请求URL**: `/api/v1/calendar/tasks/:taskId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "产品评审会议 - 更新",
    "timeRange": "09:30-11:00",
    "completed": true
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785aee",
      "name": "产品评审会议 - 更新",
      "date": "2023-04-15T09:00:00.000Z",
      "timeRange": "09:30-11:00",
      "icon": "meeting-icon",
      "color": "#4a69bd",
      "completed": true,
      "userId": "680e83932f138ea792da9b5b",
      "updatedAt": "2023-04-14T10:15:42.123Z"
    },
    "message": "日历任务更新成功"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该日历任务"
    }
  }
  ```

### 2.5 删除日历任务
- **请求方式**: DELETE
- **请求URL**: `/api/v1/calendar/tasks/:taskId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "日历任务删除成功"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该日历任务"
    }
  }
  ```

## 3. 习惯管理

### 3.1 获取习惯列表
- **请求方式**: GET
- **请求URL**: `/api/v1/habits`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求参数**:
  - `tag`: 标签名 (可选，用于标签筛选)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "680eabd58f11c9bb14785aef",
        "name": "每日阅读",
        "icon": "book-icon",
        "tags": ["学习", "自我提升"],
        "completionCount": 15,
        "streak": 5,
        "color": "#eb3b5a",
        "completedToday": true,
        "userId": "680e83932f138ea792da9b5b"
      },
      {
        "_id": "680eabd58f11c9bb14785af0",
        "name": "晨间冥想",
        "icon": "meditation-icon",
        "tags": ["健康", "心理"],
        "completionCount": 8,
        "streak": 2,
        "color": "#20bf6b",
        "completedToday": false,
        "userId": "680e83932f138ea792da9b5b"
      }
    ]
  }
  ```
- **失败响应** (401 - 未授权):
  ```json
  {
    "success": false,
    "error": {
      "message": "Authentication required"
    }
  }
  ```

### 3.2 创建习惯
- **请求方式**: POST
- **请求URL**: `/api/v1/habits`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "每日锻炼",
    "icon": "fitness-icon",
    "tags": ["健康", "运动"],
    "color": "#3867d6"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785af1",
      "name": "每日锻炼",
      "icon": "fitness-icon",
      "tags": ["健康", "运动"],
      "completionCount": 0,
      "streak": 0,
      "color": "#3867d6",
      "completedToday": false,
      "userId": "680e83932f138ea792da9b5b",
      "createdAt": "2023-04-14T08:45:23.456Z",
      "updatedAt": "2023-04-14T08:45:23.456Z"
    },
    "message": "习惯创建成功"
  }
  ```
- **失败响应** (400 - 验证失败):
  ```json
  {
    "success": false,
    "error": {
      "message": "Validation failed",
      "details": {
        "name": "习惯名称不能为空"
      }
    }
  }
  ```

### 3.3 获取单个习惯
- **请求方式**: GET
- **请求URL**: `/api/v1/habits/:habitId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785aef",
      "name": "每日阅读",
      "icon": "book-icon",
      "tags": ["学习", "自我提升"],
      "completionCount": 15,
      "streak": 5,
      "color": "#eb3b5a",
      "completedToday": true,
      "userId": "680e83932f138ea792da9b5b"
    }
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该习惯"
    }
  }
  ```

### 3.4 更新习惯
- **请求方式**: PUT
- **请求URL**: `/api/v1/habits/:habitId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "name": "每日阅读30分钟",
    "tags": ["学习", "自我提升", "阅读"],
    "color": "#fc5c65"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785aef",
      "name": "每日阅读30分钟",
      "icon": "book-icon",
      "tags": ["学习", "自我提升", "阅读"],
      "completionCount": 15,
      "streak": 5,
      "color": "#fc5c65",
      "completedToday": true,
      "userId": "680e83932f138ea792da9b5b",
      "updatedAt": "2023-04-14T10:15:42.123Z"
    },
    "message": "习惯更新成功"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该习惯"
    }
  }
  ```

### 3.5 删除习惯
- **请求方式**: DELETE
- **请求URL**: `/api/v1/habits/:habitId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "习惯删除成功"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该习惯"
    }
  }
  ```

### 3.6 完成习惯
- **请求方式**: POST
- **请求URL**: `/api/v1/habits/:habitId/complete`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "date": "2023-04-14T00:00:00.000Z" // 可选，默认为当天
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "completionCount": 16,
      "streak": 6,
      "completedToday": true
    },
    "message": "习惯标记为已完成"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该习惯"
    }
  }
  ```

### 3.7 取消完成习惯
- **请求方式**: POST
- **请求URL**: `/api/v1/habits/:habitId/uncomplete`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "date": "2023-04-14T00:00:00.000Z" // 可选，默认为当天
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "completionCount": 15,
      "streak": 5,
      "completedToday": false
    },
    "message": "习惯标记为未完成"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该习惯或完成记录"
    }
  }
  ```

### 3.8 获取习惯标签列表
- **请求方式**: GET
- **请求URL**: `/api/v1/habits/tags`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "健康",
        "count": 3
      },
      {
        "name": "学习",
        "count": 2
      },
      {
        "name": "自我提升",
        "count": 2
      },
      {
        "name": "运动",
        "count": 1
      }
    ]
  }
  ```
- **失败响应** (401 - 未授权):
  ```json
  {
    "success": false,
    "error": {
      "message": "Authentication required"
    }
  }
  ```

## 4. AI助手聊天记录

### 4.1 保存用户消息
- **请求方式**: POST
- **请求URL**: `/api/v1/assistant/conversations`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "userId": "680e83932f138ea792da9b5b",
    "message": "明天上午9点提醒我参加产品评审会议",
    "type": "user"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785af2",
      "userId": "680e83932f138ea792da9b5b",
      "message": "明天上午9点提醒我参加产品评审会议",
      "type": "user",
      "cards": {
        "events": [],
        "tasks": [],
        "habits": []
      },
      "timestamp": "2023-04-14T08:45:23.456Z",
      "createdAt": "2023-04-14T08:45:23.456Z",
      "updatedAt": "2023-04-14T08:45:23.456Z"
    }
  }
  ```
- **失败响应** (400 - 验证失败):
  ```json
  {
    "success": false,
    "error": {
      "message": "User ID and message are required"
    }
  }
  ```

### 4.2 保存AI响应
- **请求方式**: POST
- **请求URL**: `/api/v1/assistant/responses`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "userId": "680e83932f138ea792da9b5b",
    "message": "好的，我已经为您设置了明天上午9点的产品评审会议提醒。",
    "cards": {
      "events": [
        {
          "title": "产品评审会议",
          "startTime": "2023-04-15T09:00:00.000Z",
          "endTime": "2023-04-15T10:00:00.000Z"
        }
      ],
      "tasks": [],
      "habits": []
    }
  }
  ```
- **成功响应** (201):
  ```json
  {
    "success": true,
    "data": {
      "_id": "680eabd58f11c9bb14785af3",
      "userId": "680e83932f138ea792da9b5b",
      "message": "好的，我已经为您设置了明天上午9点的产品评审会议提醒。",
      "type": "ai",
      "cards": {
        "events": [
          {
            "title": "产品评审会议",
            "startTime": "2023-04-15T09:00:00.000Z",
            "endTime": "2023-04-15T10:00:00.000Z"
          }
        ],
        "tasks": [],
        "habits": []
      },
      "timestamp": "2023-04-14T08:45:25.789Z",
      "createdAt": "2023-04-14T08:45:25.789Z",
      "updatedAt": "2023-04-14T08:45:25.789Z"
    }
  }
  ```
- **失败响应** (400 - 验证失败):
  ```json
  {
    "success": false,
    "error": {
      "message": "User ID and message are required"
    }
  }
  ```

### 4.3 获取对话历史
- **请求方式**: GET
- **请求URL**: `/api/v1/assistant/conversations`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求参数**:
  - `userId`: 用户ID (必填)
  - `limit`: 返回记录数量 (可选，默认20)
  - `before`: 时间戳 (可选，用于分页)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "680eabd58f11c9bb14785af3",
        "userId": "680e83932f138ea792da9b5b",
        "message": "好的，我已经为您设置了明天上午9点的产品评审会议提醒。",
        "type": "ai",
        "cards": {
          "events": [
            {
              "title": "产品评审会议",
              "startTime": "2023-04-15T09:00:00.000Z",
              "endTime": "2023-04-15T10:00:00.000Z"
            }
          ],
          "tasks": [],
          "habits": []
        },
        "timestamp": "2023-04-14T08:45:25.789Z"
      },
      {
        "_id": "680eabd58f11c9bb14785af2",
        "userId": "680e83932f138ea792da9b5b",
        "message": "明天上午9点提醒我参加产品评审会议",
        "type": "user",
        "cards": {
          "events": [],
          "tasks": [],
          "habits": []
        },
        "timestamp": "2023-04-14T08:45:23.456Z"
      }
    ]
  }
  ```
- **失败响应** (400 - 缺少参数):
  ```json
  {
    "success": false,
    "error": {
      "message": "User ID is required"
    }
  }
  ```

### 4.4 删除对话消息
- **请求方式**: DELETE
- **请求URL**: `/api/v1/assistant/conversations/:messageId`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "消息删除成功"
  }
  ```
- **失败响应** (404 - 未找到):
  ```json
  {
    "success": false,
    "error": {
      "message": "未找到该消息"
    }
  }
  ```

### 4.5 分析用户输入
- **请求方式**: POST
- **请求URL**: `/api/v1/assistant/analyze`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求体**:
  ```json
  {
    "userId": "680e83932f138ea792da9b5b",
    "input": "明天上午9点提醒我参加产品评审会议，并且每天提醒我锻炼身体"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "title": "产品评审会议",
          "startTime": "2023-04-15T09:00:00.000Z",
          "endTime": "2023-04-15T10:00:00.000Z"
        }
      ],
      "habits": [
        {
          "name": "锻炼身体",
          "icon": "fitness-icon",
          "tags": ["健康", "运动"]
        }
      ],
      "tasks": []
    }
  }
  ```
- **失败响应** (400 - 缺少参数):
  ```json
  {
    "success": false,
    "error": {
      "message": "User ID and input are required"
    }
  }
  ```

### 4.6 清空对话历史
- **请求方式**: DELETE
- **请求URL**: `/api/v1/assistant/conversations`
- **请求头**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **请求参数**:
  - `userId`: 用户ID (必填)
- **成功响应** (200):
  ```json
  {
    "success": true,
    "message": "对话历史已清空",
    "data": {
      "deletedCount": 10
    }
  }
  ```
- **失败响应** (400 - 缺少参数):
  ```json
  {
    "success": false,
    "error": {
      "message": "User ID is required"
    }
  }
  ```
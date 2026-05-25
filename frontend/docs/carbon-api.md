{
  "openapi": "3.1.0",
  "info": {
    "title": "Eco-Agent API",
    "version": "0.1.0"
  },
  "paths": {
    "/api/appliances": {
      "get": {
        "tags": [
          "Appliances"
        ],
        "summary": "Get All Appliances",
        "operationId": "get_all_appliances_api_appliances_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "items": {
                    "$ref": "#/components/schemas/ApplianceSchema"
                  },
                  "type": "array",
                  "title": "Response Get All Appliances Api Appliances Get"
                }
              }
            }
          }
        }
      }
    },
    "/api/appliances/{appliance_id}": {
      "get": {
        "tags": [
          "Appliances"
        ],
        "summary": "Get Appliance",
        "operationId": "get_appliance_api_appliances__appliance_id__get",
        "parameters": [
          {
            "name": "appliance_id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Appliance Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ApplianceSchema"
                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/api/carbon/current": {
      "get": {
        "tags": [
          "Carbon"
        ],
        "summary": "현재 실시간 탄소 지수 조회",
        "operationId": "get_current_carbon_intensity_api_carbon_current_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CurrentCarbonResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/carbon/forecast": {
      "get": {
        "tags": [
          "Carbon"
        ],
        "summary": "향후 예측 탄소 곡선 조회",
        "operationId": "get_carbon_forecast_api_carbon_forecast_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ForecastCarbonResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/agent/chat": {
      "post": {
        "tags": [
          "Agent"
        ],
        "summary": "Chat With Eco Agent",
        "operationId": "chat_with_eco_agent_api_agent_chat_post",
        "parameters": [
          {
            "name": "appliance_id",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "title": "Appliance Id"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    },
    "/": {
      "get": {
        "tags": [
          "Root"
        ],
        "summary": "Read Root",
        "operationId": "read_root__get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          }
        }
      }
    },
    "/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "임시 데모용 루트 경로 Mock 로그인",
        "operationId": "root_login_mock_login_post",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {

                }
              }
            }
          },
          "422": {
            "description": "Validation Error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HTTPValidationError"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ApplianceSchema": {
        "properties": {
          "id": {
            "type": "string",
            "title": "Id"
          },
          "name": {
            "type": "string",
            "title": "Name"
          },
          "category": {
            "type": "string",
            "title": "Category"
          },
          "power_consumption_w": {
            "type": "number",
            "title": "Power Consumption W"
          },
          "duration_hours": {
            "type": "number",
            "title": "Duration Hours"
          },
          "energy_rating": {
            "type": "integer",
            "title": "Energy Rating"
          },
          "is_eco_friendly": {
            "type": "boolean",
            "title": "Is Eco Friendly"
          },
          "description": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "title": "Description"
          }
        },
        "type": "object",
        "required": [
          "id",
          "name",
          "category",
          "power_consumption_w",
          "duration_hours",
          "energy_rating",
          "is_eco_friendly"
        ],
        "title": "ApplianceSchema"
      },
      "BestWindow": {
        "properties": {
          "start": {
            "type": "string",
            "title": "Start",
            "description": "최적 구간 시작 시각 (ISO 8601)",
            "example": "2026-05-24T01:00:00+09:00"
          },
          "end": {
            "type": "string",
            "title": "End",
            "description": "최적 구간 종료 시각 (ISO 8601)",
            "example": "2026-05-24T03:00:00+09:00"
          }
        },
        "type": "object",
        "required": [
          "start",
          "end"
        ],
        "title": "BestWindow"
      },
      "CurrentCarbonData": {
        "properties": {
          "updated_at": {
            "type": "string",
            "title": "Updated At",
            "description": "마지막 업데이트 시각 (ISO 8601 포맷)",
            "example": "2026-05-24T12:00:00+09:00"
          },
          "carbon_intensity": {
            "type": "number",
            "title": "Carbon Intensity",
            "description": "현재 기상청 날씨 연동 탄소강도 (gCO2/kWh)",
            "example": 412
          },
          "level": {
            "type": "string",
            "title": "Level",
            "description": "탄소 배출 등급 (low / medium / high)",
            "example": "high"
          },
          "renewable_ratio": {
            "type": "number",
            "title": "Renewable Ratio",
            "description": "현재 전력망 신재생에너지 발전 비중 %",
            "example": 8.3
          },
          "coal_ratio": {
            "type": "number",
            "title": "Coal Ratio",
            "description": "현재 전력망 석탄 화력발전 비중 %",
            "example": 35.2
          }
        },
        "type": "object",
        "required": [
          "updated_at",
          "carbon_intensity",
          "level",
          "renewable_ratio",
          "coal_ratio"
        ],
        "title": "CurrentCarbonData"
      },
      "CurrentCarbonResponse": {
        "properties": {
          "status": {
            "type": "integer",
            "title": "Status",
            "description": "HTTP 상태 코드 규칙",
            "example": 200
          },
          "message": {
            "type": "string",
            "title": "Message",
            "description": "응답 메시지",
            "example": "조회 성공"
          },
          "data": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/CurrentCarbonData"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "type": "object",
        "required": [
          "status",
          "message"
        ],
        "title": "CurrentCarbonResponse"
      },
      "ForecastCarbonResponse": {
        "properties": {
          "status": {
            "type": "integer",
            "title": "Status",
            "description": "HTTP 상태 코드 규칙",
            "example": 200
          },
          "message": {
            "type": "string",
            "title": "Message",
            "description": "응답 메시지",
            "example": "조회 성공"
          },
          "data": {
            "anyOf": [
              {
                "$ref": "#/components/schemas/ForecastData"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "type": "object",
        "required": [
          "status",
          "message"
        ],
        "title": "ForecastCarbonResponse"
      },
      "ForecastData": {
        "properties": {
          "best_window": {
            "$ref": "#/components/schemas/BestWindow",
            "description": "차트 시각화용 최적 가동 시간대 정보"
          },
          "forecasts": {
            "items": {
              "$ref": "#/components/schemas/ForecastItem"
            },
            "type": "array",
            "title": "Forecasts",
            "description": "12시간 탄소 예측 곡선 데이터 배열"
          }
        },
        "type": "object",
        "required": [
          "best_window",
          "forecasts"
        ],
        "title": "ForecastData"
      },
      "ForecastItem": {
        "properties": {
          "hour": {
            "type": "string",
            "title": "Hour",
            "description": "예측 대상 시각 (ISO 8601)",
            "example": "2026-05-24T15:00:00+09:00"
          },
          "carbon_intensity": {
            "type": "number",
            "title": "Carbon Intensity",
            "description": "해당 시간대의 예상 탄소강도 수치",
            "example": 390
          },
          "level": {
            "type": "string",
            "title": "Level",
            "description": "해당 시간대의 탄소 배출 등급 (low / medium / high)",
            "example": "medium"
          }
        },
        "type": "object",
        "required": [
          "hour",
          "carbon_intensity",
          "level"
        ],
        "title": "ForecastItem"
      },
      "HTTPValidationError": {
        "properties": {
          "detail": {
            "items": {
              "$ref": "#/components/schemas/ValidationError"
            },
            "type": "array",
            "title": "Detail"
          }
        },
        "type": "object",
        "title": "HTTPValidationError"
      },
      "LoginRequest": {
        "properties": {
          "id": {
            "type": "string",
            "title": "Id"
          },
          "password": {
            "type": "string",
            "title": "Password"
          }
        },
        "type": "object",
        "required": [
          "id",
          "password"
        ],
        "title": "LoginRequest"
      },
      "ValidationError": {
        "properties": {
          "loc": {
            "items": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "integer"
                }
              ]
            },
            "type": "array",
            "title": "Location"
          },
          "msg": {
            "type": "string",
            "title": "Message"
          },
          "type": {
            "type": "string",
            "title": "Error Type"
          },
          "input": {
            "title": "Input"
          },
          "ctx": {
            "type": "object",
            "title": "Context"
          }
        },
        "type": "object",
        "required": [
          "loc",
          "msg",
          "type"
        ],
        "title": "ValidationError"
      }
    }
  }
}
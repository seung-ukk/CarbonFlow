# Carbon API 명세서

{
  "openapi": "3.1.0",
  "info": {
    "title": "Eco-Agent API",
    "version": "0.1.0"
  },
  "paths": {
    "/appliances": {
      "get": {
        "tags": [
          "Appliances"
        ],
        "summary": "Get All Appliances",
        "description": "프론트엔드가 가전 목록을 조회해가는 완벽하게 검증된 엔드포인트",
        "operationId": "get_all_appliances_appliances_get",
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
                  "title": "Response Get All Appliances Appliances Get"
                }
              }
            }
          }
        }
      }
    },
    "/appliances/{appliance_id}": {
      "get": {
        "tags": [
          "Appliances"
        ],
        "summary": "Get Appliance",
        "description": "특정 가전제품 정보 상세 조회",
        "operationId": "get_appliance_appliances__appliance_id__get",
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
    "/carbon/intensity": {
      "get": {
        "tags": [
          "Carbon"
        ],
        "summary": "실시간 탄소 집약도 및 24시간 예측 데이터 조회",
        "description": "실시간 탄소 집약도 및 24시간 예측 데이터 반환 엔드포인트",
        "operationId": "get_carbon_intensity_carbon_intensity_get",
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CarbonIntensityResponse"
                }
              }
            }
          }
        }
      }
    },
    "/agent/chat": {
      "post": {
        "tags": [
          "Agent"
        ],
        "summary": "Chat With Eco Agent",
        "description": "서버 정상 가동 테스트를 위한 임시 에이전트 샌드박스 엔드포인트",
        "operationId": "chat_with_eco_agent_agent_chat_post",
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
      "CarbonIntensityResponse": {
        "properties": {
          "current": {
            "$ref": "#/components/schemas/CurrentCarbonResponse",
            "description": "현재 실시간 탄소 데이터"
          },
          "forecast": {
            "items": {
              "$ref": "#/components/schemas/ForecastItem"
            },
            "type": "array",
            "title": "Forecast",
            "description": "향후 24시간 예측 추이 데이터 리스트"
          }
        },
        "type": "object",
        "required": [
          "current",
          "forecast"
        ],
        "title": "CarbonIntensityResponse"
      },
      "CurrentCarbonResponse": {
        "properties": {
          "carbon_intensity": {
            "type": "number",
            "title": "Carbon Intensity",
            "description": "현재 기상청 실황 날씨 버프가 반영된 실시간 탄소강도 (gCO2/kWh)",
            "example": 320.5
          },
          "status": {
            "type": "string",
            "title": "Status",
            "description": "탄소 효율 등급 (좋음/보통/나쁨)",
            "example": "좋음"
          },
          "unit": {
            "type": "string",
            "title": "Unit",
            "description": "데이터 단위",
            "default": "gCO2/kWh",
            "example": "gCO2/kWh"
          }
        },
        "type": "object",
        "required": [
          "carbon_intensity",
          "status"
        ],
        "title": "CurrentCarbonResponse"
      },
      "ForecastItem": {
        "properties": {
          "time": {
            "type": "string",
            "title": "Time",
            "description": "예측 타임라인 시간대 (현재 시각 기준 동적 정렬)",
            "example": "15:00"
          },
          "carbon_intensity": {
            "type": "number",
            "title": "Carbon Intensity",
            "description": "해당 시간대의 예상 탄소강도 수치",
            "example": 307.5
          }
        },
        "type": "object",
        "required": [
          "time",
          "carbon_intensity"
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
/**
 * Google Apps Script (구글 시트 연동 CRUD Web App)
 * 
 * [구글 시트 칼럼 구조 (1행 헤더 기준)]
 * A열: timestamp  (고유 식별자 / 밀리초 등)
 * B열: datetime   (작성/수정 일시: YYYY.MM.DD (요일) HH:mm)
 * C열: content    (메모 본문 내용)
 * D열: category   (카테고리: 할 일, 아이디어, 기타)
 * E열: color      (배경색 HEX: #FEF08A 등)
 * F열: state      (상태: active, completed, deleted 등)
 * G열: order      (정렬 순서: 정수)
 */

const SHEET_NAME = "Sheet1";

function getSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
}

// 1. 조회 (Read)
function doGet(e) {
  try {
    const sheet = getSpreadsheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    const rows = data.slice(1);

    const items = rows.map((row) => {
      return {
        timestamp: String(row[0] || ""),
        datetime: String(row[1] || ""),
        content: String(row[2] || ""),
        category: String(row[3] || "할 일"),
        color: String(row[4] || "#FEF08A"),
        state: String(row[5] || "active"),
        order: Number(row[6]) || 0,
      };
    }).filter((item) => item.timestamp !== "" && item.state !== "deleted");

    // order 기준 오름차순 정렬
    items.sort((a, b) => a.order - b.order);

    return createJsonResponse({ success: true, data: items });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// 2. 추가 / 수정 / 삭제 / 순서 재배치 (Create / Update / Delete / Reorder)
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action; // 'create' | 'update' | 'delete' | 'reorder'
    const sheet = getSpreadsheet();

    // 1행 헤더가 없을 경우 자동 초기화
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["timestamp", "datetime", "content", "category", "color", "state", "order"]);
    }

    // [Create] 메모 추가
    if (action === "create") {
      const item = requestData.data;
      sheet.appendRow([
        String(item.timestamp),
        String(item.datetime),
        String(item.content),
        String(item.category || "할 일"),
        String(item.color || "#FEF08A"),
        String(item.state || "active"),
        Number(item.order !== undefined ? item.order : 0),
      ]);
      return createJsonResponse({ success: true, message: "Created successfully", data: item });
    }

    // [Update] 메모 내용 또는 속성 수정
    if (action === "update") {
      const { timestamp, content, category, color, state, order } = requestData.data;
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(timestamp)) {
          foundRow = i + 1; // 1-indexed
          break;
        }
      }

      if (foundRow !== -1) {
        if (content !== undefined) sheet.getRange(foundRow, 3).setValue(String(content));
        if (category !== undefined) sheet.getRange(foundRow, 4).setValue(String(category));
        if (color !== undefined) sheet.getRange(foundRow, 5).setValue(String(color));
        if (state !== undefined) sheet.getRange(foundRow, 6).setValue(String(state));
        if (order !== undefined) sheet.getRange(foundRow, 7).setValue(Number(order));
        
        return createJsonResponse({ success: true, message: "Updated successfully" });
      } else {
        return createJsonResponse({ success: false, error: "Item not found" });
      }
    }

    // [Delete] 메모 행 즉시 삭제
    if (action === "delete") {
      const { timestamp } = requestData.data;
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(timestamp)) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow !== -1) {
        sheet.deleteRow(foundRow);
        return createJsonResponse({ success: true, message: "Deleted successfully" });
      } else {
        return createJsonResponse({ success: false, error: "Item not found" });
      }
    }

    // [Reorder] 일괄 순서(order) 업데이트
    if (action === "reorder") {
      const orders = requestData.data; // [{ timestamp: string, order: number }]
      const orderMap = {};
      orders.forEach((item) => {
        orderMap[String(item.timestamp)] = Number(item.order);
      });

      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const ts = String(data[i][0]);
        if (orderMap[ts] !== undefined) {
          sheet.getRange(i + 1, 7).setValue(orderMap[ts]); // G열: order
        }
      }

      return createJsonResponse({ success: true, message: "Reordered successfully" });
    }

    return createJsonResponse({ success: false, error: "Unknown action" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

let db = null;

// IndexedDB 생성 및 오픈
function openDB() {
    const request = indexedDB.open("bookDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        console.log("1_DB 생성 및 업그레이드 완료...");
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("1_DB 오픈 완료...");
    };

    request.onerror = function (event) {
        console.error("1_DB 오픈 실패:", event.target.errorCode);
    };
}

// 데이터 삽입
function insertBook() {
    const type = $('#bookType1').val();
    const name = $('#bookName1').val();

    if (!type || !name) {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    const transaction = db.transaction(["books"], "readwrite");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.add({ type, name });

    request.onsuccess = function () {
        console.log("3_ 책 등록 성공...");
        alert(`도서명 '${name}'이(가) 입력되었습니다.`);
        $('#bookName1').val('');
        $('#bookType1').val('미정').attr('selected', 'selected');
        $('#bookType1').selectmenu('refresh');
    };

    request.onerror = function () {
        alert("데이터 삽입 중 오류가 발생했습니다.");
    };
}

// 전체 데이터 검색
function listBook() {
    const transaction = db.transaction(["books"], "readonly");
    const objectStore = transaction.objectStore("books");

    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        const books = event.target.result;

        console.log(` 책 조회... ${books.length}건.`);
        if (books.length === 0) {
            alert("등록된 도서가 없습니다.");
            return;
        }

        // 탐색 위치 설정
        if (position === 'first') {
            index = 0;
        } else if (position === 'prev') {
            index = Math.max(0, index - 1);
        } else if (position === 'next') {
            index = Math.min(books.length - 1, index + 1);
        } else if (position === 'last') {
            index = books.length - 1;
        }

        const book = books[index];
        $('#bookType4').val(book.type);
        $('#bookName4').val(book.name);
    };

    request.onerror = function () {
        alert("데이터 조회 중 오류가 발생했습니다.");
    };
}

// 데이터 수정
function updateBook() {
    const oldName = $('#sBookName2').val();
    const newType = $('#bookType2').val();
    const newName = $('#bookName2').val();

    if (!oldName || !newType || !newName) {
        alert("모든 필드를 입력해주세요.");
        return;
    }

    const transaction = db.transaction(["books"], "readwrite");
    const objectStore = transaction.objectStore("books");

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            if (cursor.value.name === oldName) {
                const updatedData = { ...cursor.value, type: newType, name: newName };
                cursor.update(updatedData);
                alert(`도서명 '${oldName}'이(가) '${newName}'으로 수정되었습니다.`);
                return;
            }
            cursor.continue();
        } else {
            alert("수정할 도서를 찾을 수 없습니다.");
        }
    };
}

// 데이터 삭제
function deleteBook() {
    const name = $('#sBookName3').val();

    if (!name) {
        alert("삭제할 도서명을 입력해주세요.");
        return;
    }

    const transaction = db.transaction(["books"], "readwrite");
    const objectStore = transaction.objectStore("books");

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            if (cursor.value.name === name) {
                cursor.delete();
                alert(`도서명 '${name}'이(가) 삭제되었습니다.`);
                return;
            }
            cursor.continue();
        } else {
            alert("삭제할 도서를 찾을 수 없습니다.");
        }
    };
}

// 조건 검색
function selectBook(name, callback) {
    const transaction = db.transaction(["books"], "readonly");
    const objectStore = transaction.objectStore("books");

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            if (cursor.value.name === name) {
                callback(cursor.value);
                return;
            }
            cursor.continue();
        } else {
            alert("검색된 도서가 없습니다.");
        }
    };
}

// 데이터 수정용 검색
function selectBook2(name) {
    selectBook(name, function (book) {
        $('#bookType2').val(book.type).attr('selected', 'selected');
        $('#bookType2').selectmenu('refresh');
        $('#bookName2').val(book.name);
    });
}

// 데이터 삭제용 검색
function selectBook3(name) {
    selectBook(name, function (book) {
        $('#bookType3').val(book.type);
        $('#bookName3').val(book.name);
    });
}

// 조건 검색
function selectBook4(name) {
    selectBook(name, function (book) {
        $('#bookType4').val(book.type);
        $('#bookName4').val(book.name);
    });
}

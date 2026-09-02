import requests
import json
import time
import os

BASE_URL = 'http://127.0.0.1:8000/api'

def run_multi_source_tests():
    print("=" * 70)
    print("KISHORE S AI MENTOR — DYNAMIC MULTI-SOURCE & DUAL MODE QA SUITE")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Health Check
    # -------------------------------------------------------------
    t0 = time.time()
    h = requests.get(f'{BASE_URL}/health').json()
    print(f"[TEST 1] Health Check ({round(time.time()-t0, 2)}s): {h}")
    assert h.get("status") == "healthy", "Health check failed"

    # -------------------------------------------------------------
    # 2. TEST 1 — Computer Networks Document Ingestion & Grounded QA
    # -------------------------------------------------------------
    cn_text = """
    # Computer Networking: Transport Layer Protocols

    [Page 1]
    Transmission Control Protocol (TCP) is a connection-oriented transport protocol that guarantees reliable delivery of data packets.
    Before data transfer begins, TCP establishes a virtual connection using the Three-Way Handshake:
    1. SYN: The client sends a segment with SYN flag set and an initial sequence number (ISN_c).
    2. SYN-ACK: The server responds with SYN and ACK flags set, acknowledging the client's sequence number and providing its own ISN_s.
    3. ACK: The client sends an ACK segment confirming the server's sequence number. The connection is now established.

    [Page 2]
    TCP provides Flow Control via sliding window mechanisms and Congestion Control via AIMD (Additive Increase Multiplicative Decrease).
    """
    
    # Save temporary CN doc
    cn_path = "temp_cn_notes.txt"
    with open(cn_path, "w", encoding="utf-8") as f:
        f.write(cn_text)

    t0 = time.time()
    with open(cn_path, "rb") as f:
        up_cn = requests.post(f'{BASE_URL}/material/upload', files={'file': ('Computer_Networks.txt', f, 'text/plain')}).json()
    cn_doc_id = up_cn['document_id']
    print(f"[TEST 2] CN Material Uploaded ({round(time.time()-t0, 2)}s): ID={cn_doc_id}, Chunks={up_cn['chunk_count']}")

    # Ask CN Question in Document Mode
    t0 = time.time()
    cn_chat = requests.post(f'{BASE_URL}/chat/message', json={
        'message': 'Explain how the TCP three-way handshake works step-by-step.',
        'document_id': cn_doc_id,
        'topic': 'Computer Networks'
    }).json()
    print(f"[TEST 2.1] Grounded CN Answer ({round(time.time()-t0, 2)}s): response_id={cn_chat.get('response_id')}")
    print(f"           Citations: {cn_chat.get('citations')}")
    print(f"           Spoken: {cn_chat.get('spoken_script')[:90]}...")
    
    cn_content_lower = cn_chat.get('message', '').lower()
    assert "syn" in cn_content_lower or "handshake" in cn_content_lower, "Grounded CN answer missed core TCP handshake concept"
    assert "ohm" not in cn_content_lower and "voltage" not in cn_content_lower, "Contamination: Found electrical circuits in CN answer!"

    # -------------------------------------------------------------
    # 3. TEST 2 — Database Management Document Ingestion & Grounded QA
    # -------------------------------------------------------------
    dbms_text = """
    # Database Management Systems: Relational Normalization

    [Page 1]
    Database Normalization is the systematic technique of organizing tables to minimize data redundancy and eliminate anomalies (Insertion, Deletion, Update anomalies).
    1. First Normal Form (1NF): Each column contains atomic values, and each record is unique.
    2. Second Normal Form (2NF): Meets 1NF and contains no Partial Dependencies (all non-key attributes are fully functionally dependent on the entire Primary Key).
    3. Third Normal Form (3NF): Meets 2NF and contains no Transitive Dependencies (non-key attributes do not depend on other non-key attributes; X -> Y where X is superkey or Y is prime).
    """
    
    dbms_path = "temp_dbms_notes.txt"
    with open(dbms_path, "w", encoding="utf-8") as f:
        f.write(dbms_text)

    t0 = time.time()
    with open(dbms_path, "rb") as f:
        up_dbms = requests.post(f'{BASE_URL}/material/upload', files={'file': ('DBMS_Normalization.txt', f, 'text/plain')}).json()
    dbms_doc_id = up_dbms['document_id']
    print(f"[TEST 3] DBMS Material Uploaded ({round(time.time()-t0, 2)}s): ID={dbms_doc_id}, Chunks={up_dbms['chunk_count']}")

    # Ask DBMS Question in Document Mode
    t0 = time.time()
    dbms_chat = requests.post(f'{BASE_URL}/chat/message', json={
        'message': 'What is the key difference between 2NF and 3NF normalization?',
        'document_id': dbms_doc_id,
        'topic': 'Database Systems'
    }).json()
    print(f"[TEST 3.1] Grounded DBMS Answer ({round(time.time()-t0, 2)}s): response_id={dbms_chat.get('response_id')}")
    print(f"           Citations: {dbms_chat.get('citations')}")
    print(f"           Spoken: {dbms_chat.get('spoken_script')[:90]}...")
    
    dbms_content_lower = dbms_chat.get('message', '').lower()
    assert "partial" in dbms_content_lower or "transitive" in dbms_content_lower or "dependency" in dbms_content_lower, "Grounded DBMS answer missed normalization dependency concept"

    # -------------------------------------------------------------
    # 4. TEST 3 — Strict Cross-Session Isolation Verification
    # -------------------------------------------------------------
    print("[TEST 4] Verifying Zero Cross-Document Contamination...")
    assert "syn" not in dbms_content_lower and "handshake" not in dbms_content_lower, "Cross-contamination: Found TCP context in DBMS answer!"
    assert "ohm" not in dbms_content_lower and "voltage" not in dbms_content_lower, "Contamination: Found electrical circuits in DBMS answer!"
    print("         [PASS] Pure isolation confirmed between CN and DBMS documents.")

    # -------------------------------------------------------------
    # 5. TEST 4 — Mode B: General Voice/Chat Mode (NO Document Attached)
    # -------------------------------------------------------------
    t0 = time.time()
    gen_chat = requests.post(f'{BASE_URL}/chat/message', json={
        'message': 'What is recursion in computer science and how does the call stack work?',
        'document_id': None,
        'topic': 'Computer Science Programming'
    }).json()
    print(f"[TEST 5] General Chat (Recursion) ({round(time.time()-t0, 2)}s): response_id={gen_chat.get('response_id')}")
    print(f"         Spoken: {gen_chat.get('spoken_script')[:90]}...")
    
    gen_content_lower = gen_chat.get('message', '').lower()
    assert "base case" in gen_content_lower or "stack" in gen_content_lower or "call" in gen_content_lower or "function" in gen_content_lower, "General mode missed recursion concept"
    assert "ohm" not in gen_content_lower and "voltage" not in gen_content_lower and "circuit" not in gen_content_lower, "Contamination: Found electrical circuits in recursion answer!"

    # -------------------------------------------------------------
    # 6. TEST 5 — General Voice Audio TTS Exact Playback
    # -------------------------------------------------------------
    t0 = time.time()
    spoken_txt = gen_chat.get('spoken_script') or "Recursion is a function calling itself until it reaches a base case."
    tts_res = requests.post(f'{BASE_URL}/voice/speak', json={
        'text': spoken_txt,
        'language': 'English',
        'response_id': gen_chat.get('response_id')
    })
    print(f"[TEST 6] Edge Neural Voice Synthesis ({round(time.time()-t0, 2)}s): HTTP {tts_res.status_code}, Audio Size={len(tts_res.content)} bytes")
    assert tts_res.status_code == 200 and len(tts_res.content) > 1000, "TTS audio synthesis failed"

    # -------------------------------------------------------------
    # 7. TEST 6 — Material Removal & Purge
    # -------------------------------------------------------------
    t0 = time.time()
    del_res = requests.delete(f'{BASE_URL}/material/{cn_doc_id}').json()
    print(f"[TEST 7] Material Removal ({round(time.time()-t0, 2)}s): {del_res}")
    assert del_res.get('success') == True and del_res.get('mode') == 'GENERAL_MODE', "Material removal failed"

    # Clean up temp files
    try:
        os.remove(cn_path)
        os.remove(dbms_path)
    except:
        pass

    print("=" * 70)
    print("ALL DUAL-MODE & MULTI-SOURCE QA TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == '__main__':
    run_multi_source_tests()

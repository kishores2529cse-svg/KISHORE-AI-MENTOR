import requests
import json
import time

BASE_URL = 'http://127.0.0.1:8000/api'

def run_tests():
    print("=" * 60)
    print("KISHORE S AI MENTOR — FULL QA & TTS VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health Check
    t0 = time.time()
    h = requests.get(f'{BASE_URL}/health').json()
    print(f"[TEST 1] Health Check ({round(time.time()-t0, 2)}s): {h}")
    assert h.get("status") == "healthy", "Health check failed"

    # 2. Lesson Creation
    t0 = time.time()
    plan = requests.post(f'{BASE_URL}/lesson/create', json={
        'topic': "Ohm's Law & Circuit Dynamics",
        'level': 'Beginner',
        'language': 'English',
        'duration_minutes': 20,
        'teaching_style': 'Visual',
        'learning_objective': 'Understand concept',
        'desired_depth': 'Standard'
    }).json()
    lesson_id = plan['lesson_id']
    print(f"[TEST 2] Lesson Created ({round(time.time()-t0, 2)}s): ID={lesson_id}, Concepts={plan.get('concepts')[:2]}")

    # 3. Start Lesson & Authoritative Response
    t0 = time.time()
    start = requests.post(f'{BASE_URL}/lesson/{lesson_id}/start').json()
    resp_id_1 = start.get('response_id')
    spoken_1 = start.get('spoken_text')
    print(f"[TEST 3] Start Lesson ({round(time.time()-t0, 2)}s): response_id={resp_id_1}")
    print(f"         Spoken snippet: {spoken_1[:80]}...")
    assert resp_id_1 is not None, "Missing response_id on start"

    # 4. Answer Evaluation with Misconception Check (Ohm's Law: 'Current increases')
    t0 = time.time()
    ans = requests.post(f'{BASE_URL}/lesson/{lesson_id}/answer', json={
        'answer': 'Current increases'
    }).json()
    resp_id_2 = ans.get('response_id')
    feedback = ans.get('teacher_feedback')
    print(f"[TEST 4] Answer Evaluation ({round(time.time()-t0, 2)}s): Correct={ans.get('correct')}, response_id={resp_id_2}")
    print(f"         Teacher Feedback: {feedback}")
    assert ans.get('correct') == False, "Misconception should be marked incorrect"
    assert resp_id_2 is not None, "Missing response_id on evaluation"

    # 5. Pedagogical Action Triggers (Explain Differently, Give Example, Make Simpler)
    for action in ['EXPLAIN_DIFFERENTLY', 'GIVE_EXAMPLE', 'MAKE_SIMPLER', 'MAKE_HARDER', 'DONT_UNDERSTAND']:
        t0 = time.time()
        act = requests.post(f'{BASE_URL}/lesson/{lesson_id}/trigger-action', json={
            'action_type': action
        }).json()
        resp_id_act = act.get('response_id')
        print(f"[TEST 5] Action '{action}' ({round(time.time()-t0, 2)}s): response_id={resp_id_act}")
        print(f"         Teacher: {act.get('spoken_text')[:80]}...")
        assert resp_id_act is not None, f"Missing response_id for action {action}"

    # 6. Multi-Language Neural Voice Synthesis
    for lang, txt in [
        ('English', 'Let us understand voltage, current, and resistance in electrical circuits.'),
        ('Tamil', 'மின்னழுத்தம் மற்றும் மின்தடையை புரிந்து கொள்வோம்.'),
        ('Hindi', 'आइए वोल्टेज और प्रतिरोध के सिद्धांत को समझें।')
    ]:
        t0 = time.time()
        tts = requests.post(f'{BASE_URL}/voice/speak', json={
            'text': txt,
            'language': lang,
            'response_id': 'test_resp_123'
        })
        print(f"[TEST 6] Multi-Language TTS ({lang}) ({round(time.time()-t0, 2)}s): HTTP {tts.status_code}, Audio Size={len(tts.content)} bytes")
        assert tts.status_code == 200, f"TTS failed for language {lang}"
        assert len(tts.content) > 1000, f"TTS returned empty audio for {lang}"

    # 7. Interactive Real-Time Chat Message
    t0 = time.time()
    chat_res = requests.post(f'{BASE_URL}/chat/message', json={
        'message': 'Can you give me an analogy for resistance?',
        'topic': "Ohm's Law",
        'history': []
    }).json()
    chat_resp_id = chat_res.get('response_id')
    print(f"[TEST 7] Chat Message ({round(time.time()-t0, 2)}s): response_id={chat_resp_id}")
    print(f"         Spoken Script: {chat_res.get('spoken_script')[:80]}...")
    assert chat_resp_id is not None, "Missing response_id on chat"

    print("=" * 60)
    print("ALL 7 END-TO-END QA TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()

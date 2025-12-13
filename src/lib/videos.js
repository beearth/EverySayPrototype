// Mapped by filename number: 1.mp4 -> Script 1 ("힘내요"), 2.mp4 -> Script 2 ("Nice one Sonny"), etc.
// Note: User explicitly asked for #1 to be "Nice one Sonny" and #2 to be "힘내요".
// However, the files are 1.mp4, 2.mp4...
// Let's align logically: 
// 1.mp4 -> Script 2 ("Nice one Sonny") per user request "1번이 나이스 원 소니"
// 2.mp4 -> Script 1 ("힘내요") per user request "2번이 힘내요"
// For the rest, we will map sequentially: 3.mp4 -> Script 3, 4.mp4 -> Script 4, etc.
// Script List (0-indexed reference):
// 1. 힘내요
// 2. Nice one Sonny
// 3. 고마워 어프리쉬에이트
// 4. 브레이브
// 5. 괜찮아
// 6. I love Earth
// 7. I love you
// 8. 000 생일 축하 합니다
// 9. Plz be safe
// 10. 기부할게요
// 11. 투병을 응원합니다
// 12. Hope
// 13. I love 000
// 14. Happy Birthday 000
// 15. I love BTS...
// 16. Peace
// 17. 000 아멘
// 18. Freedom...
// 19. Hamo...
// 20. I can do too
// 21. I love you baby

// Mapped by Visual Order (Index): 1st video -> Script 1, 2nd video -> Script 2...
export const videos = [
  {
    "id": "v01",
    "title": "Concert Energy",
    "tag": "Prototype",
    "src": "/videos/1.mp4",
    "cheer": "nice one sonny",
    "cheerScript": "nice one sonny"
  },
  {
    "id": "v02",
    "title": "Warm Sunset",
    "tag": "Prototype",
    "src": "/videos/10.mp4",
    "cheer": "힘내요",
    "cheerScript": "힘내요"
  },
  {
    "id": "v03",
    "title": "Robotic Companion",
    "tag": "Prototype",
    "src": "/videos/11.mp4",
    "cheer": "고마워 어프리쉬에이트",
    "cheerScript": "고마워 어프리쉬에이트"
  },
  {
    "id": "v04",
    "title": "Sunset Drive",
    "tag": "Prototype",
    "src": "/videos/12.mp4",
    "cheer": "브레이브",
    "cheerScript": "브레이브"
  },
  {
    "id": "v05",
    "title": "Surfing Waves",
    "tag": "Prototype",
    "src": "/videos/13.mp4",
    "cheer": "괜찮아",
    "cheerScript": "괜찮아"
  },
  {
    "id": "v06",
    "title": "Night City",
    "tag": "Prototype",
    "src": "/videos/14.mp4",
    "cheer": "i love earth",
    "cheerScript": "i love earth"
  },
  {
    "id": "v07",
    "title": "Dog Kisses",
    "tag": "Demo",
    "src": "/videos/15.mp4",
    "cheer": "i love you 000",
    "cheerScript": "i love you 000"
  },
  {
    "id": "v08",
    "title": "Birthday Wishes",
    "tag": "Demo",
    "src": "/videos/16.mp4",
    "cheer": "000 생일 축하 합니다",
    "cheerScript": "000 생일 축하 합니다"
  },
  {
    "id": "v09",
    "title": "Child Drawing",
    "tag": "Demo",
    "src": "/videos/17.mp4",
    "cheer": "plz be safe",
    "cheerScript": "plz be safe"
  },
  {
    "id": "v10",
    "title": "Winning Moment",
    "tag": "Demo",
    "src": "/videos/18.mp4",
    "cheer": "기부할게요",
    "cheerScript": "기부할게요"
  },
  {
    "id": "v11",
    "title": "Device Connection",
    "tag": "Demo",
    "src": "/videos/19.mp4",
    "cheer": "투병을 응원합니다",
    "cheerScript": "투병을 응원합니다"
  },
  {
    "id": "v12",
    "title": "Night View",
    "tag": "Demo",
    "src": "/videos/2.mp4",
    "cheer": "hope",
    "cheerScript": "hope"
  },
  {
    "id": "v13",
    "title": "Study Time",
    "tag": "Demo",
    "src": "/videos/20.mp4",
    "cheer": "i love 000",
    "cheerScript": "i love 000"
  },
  {
    "id": "v14",
    "title": "Selfie Smile",
    "tag": "Demo",
    "src": "/videos/21.mp4",
    "cheer": "해피 버스데이 000",
    "cheerScript": "해피 버스데이 000"
  },
  {
    "id": "v15",
    "title": "Cheering Crowd",
    "tag": "Demo",
    "src": "/videos/3.mp4",
    "cheer": "i love bts, 블랙핑크, 에스파, 장원영 (선택)",
    "cheerScript": "i love bts, 블랙핑크, 에스파, 장원영 (선택)"
  },
  {
    "id": "v16",
    "title": "Driving Fast",
    "tag": "Demo",
    "src": "/videos/4.mp4",
    "cheer": "peace",
    "cheerScript": "peace"
  },
  {
    "id": "v17",
    "title": "Cross Symbol",
    "tag": "Demo",
    "src": "/videos/5.mp4",
    "cheer": "000 아멘",
    "cheerScript": "000 아멘"
  },
  {
    "id": "v18",
    "title": "Coffee Break",
    "tag": "Demo",
    "src": "/videos/6.mp4",
    "cheer": "프리덤, 러브 , 피스 , 호프 (선택)",
    "cheerScript": "프리덤, 러브 , 피스 , 호프 (선택)"
  },
  {
    "id": "v19",
    "title": "Global Network",
    "tag": "Demo",
    "src": "/videos/7.mp4",
    "cheer": "하모니, 러브 , 피스 , 위스덤 (선택)",
    "cheerScript": "하모니, 러브 , 피스 , 위스덤 (선택)"
  },
  {
    "id": "v20",
    "title": "Listening Child",
    "tag": "Demo",
    "src": "/videos/8.mp4",
    "cheer": "i can do it",
    "cheerScript": "i can do it"
  },
  {
    "id": "v21",
    "title": "Playing Time",
    "tag": "Demo",
    "src": "/videos/9.mp4",
    "cheer": "i love you baby",
    "cheerScript": "i love you baby"
  }
];

## 💡 Issue Number

None

## Description

- 프로필 페이지 구현 (내 정보 화면)
- 통계 카드 컴포넌트 추가 (즐겨찾기, 제보 내역, 획득한 칭찬)
- 제보 및 설정 메뉴 섹션 구현
- 프로필 페이지용 에셋 추가 (화살표 아이콘, 이음 로고)
- Text 컴포넌트 및 테마에 폰트 weight 지원 추가
- 프로필 페이지 구현에 필요한 의존성 추가 (expo-asset, expo-linear-gradient, react-native-svg)

## 🔧 변경 타입

- [x] 기능 추가
- [ ] 버그 수정
- [x] 코드 리팩토링
- [x] UI/UX 개선
- [ ] 문서 업데이트
- [x] 의존성 업데이트
- [ ] 파일 혹은 폴더 수정
- [ ] 파일 혹은 폴더 삭제
- [ ] 기타 (아래에 설명)

## ✅ Reviewer

- [ ]

- [ ]

- [ ]

## 💬 Comment

- 프로필 페이지는 ScrollView를 사용하여 스크롤 가능한 레이아웃으로 구현했습니다
- 통계 카드는 LinearGradient를 사용하여 그라데이션 효과를 적용했습니다
- iOS와 Android 모두 지원하도록 Platform.select를 사용하여 shadow 스타일을 적용했습니다
- CustomText 컴포넌트에 다양한 font weight 옵션을 추가하여 일관된 텍스트 스타일링을 지원합니다



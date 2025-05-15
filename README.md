# 웹프 블록깨기 과제

## 구성원
* 권구현
* 김민수
* 엄정석
* 홍연일

## 환경
* html5 / css / js

## git branch
### branch / 팀 정보
- main
- (브랜치 이름) - 메인 게임 제작
    - 권구현, 김민수
- (브랜치 이름) - 미니 게임, 스토리, 설정, 메인화면, 전체 흐름 제작
    - 엄정석, 홍연일

### git에 파일 올리는 방법
0. git clone
```bash
# 먼저 해당 프로젝트 폴더를 넣고 싶은 폴더로 간다.
# ex) /home/user/dev/pybank_2025 이렇게 위치하려면 /home/user/dev로 이동해서 clone을 받아야 함. (main branch)
git clone https://github.com/daybreaker42/pybank_2025.git
```

1. 각자의 branch로 바꾸고 main merge
```bash
# ex) 한성준의 경우 - branch teamC로 변경
git checkout teamC

git pull origin main
```

2. (파일 수정 후) 업로드 전 변경사항들을 commit한다.
```bash
git add .
# git commit -m "UPDATE: 계좌 입금 기능 완성; ADD: 계좌 출금 기능 추가; FIX: 계좌 송금시 보내는 사람 계좌에서 돈이 안빠지던 버그 수정 완"
git commit -m "{커밋메세지}"
```

3. **branch가 main이 아닌지 확인한 뒤** 각자의 branch에 push한다.
```bash
git push -u origin teamC
```

4. github에 가서 pull request를 만든다.
5. 이상이 없다면 main branch에 merge한다.





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
- mainGame : 메인 게임 제작
    - 권구현, 김민수
- (브랜치 이름) : 미니 게임, 스토리, 설정, 메인화면, 전체 흐름 제작
    - 엄정석, 홍연일

### git에 파일 올리는 방법
- origin branch_name, origin/branch_name -> github에 있는 브랜치의 코드
- branch_name -> 로컬(각자 pc)에 있는 코드
- 각 팀이 브랜치의 내용을 공유하려면 branch_name이 아닌 **origin branch_name**에 업로드 해야함.

0. git clone
```bash
# 먼저 해당 프로젝트 폴더를 넣고 싶은 폴더로 간다.
# ex) /home/user/dev/web_programming_brick_breaking 이렇게 위치하려면 /home/user/dev로 이동해서 clone을 받아야 함. (main branch)
git clone https://github.com/implement-k/web_programming_brick_breaking.git
```

1. 각자의 branch로 바꾸고 main의 내용을 본인 팀의 브랜치로 불러온다.(본인의 브랜치를 최신으로 유지하려면)
```bash
git checkout teamA

git pull origin main
```

2. (파일 수정 후) 파일을 브랜치에 업로드하기 전에 commit을 해준다.
```bash
git add .
# git commit -m "UPDATE: 기능 수정; ADD: 기능 추가; FIX: 버그 픽스"
git commit -m "{커밋메세지}"
```

3. **branch가 main이 아닌지 확인한 뒤** 각자의 branch에 push한다.
```bash
git push -u origin teamA
or
git push origin teamA
```

4. github에 가서 pull request를 만든다.
5. 이상이 없다면 main branch에 merge한다.(본인 브랜치의 변경사항을 main에 업로드한다.)
6. conflict가 난다면 오류나는 코드 중 유지할 코드를 선택한다.





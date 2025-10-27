import Link from "next/link"
import { Radio, Search, Bell, Bookmark, TrendingUp, Sparkles, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Pulse 사용 가이드</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            AI 기반 뉴스 애그리게이터의 모든 기능을 알아보세요
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-6">
          {/* AI 요약 기능 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI 뉴스 요약</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                각 뉴스 카드의 "AI 요약" 버튼을 클릭하면 OpenAI GPT-4o-mini를 활용한 3줄 요약과 핵심 키워드를 확인할 수 있습니다.
              </CardDescription>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>전체 기사를 크롤링하여 정확한 요약 제공</li>
                <li>요약 결과는 캐싱되어 빠른 재조회 가능</li>
                <li>핵심 키워드 자동 추출</li>
              </ul>
            </CardContent>
          </Card>

          {/* 양방향 검색 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle>양방향 검색 (한/영 자동 번역)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                한국어로 검색하면 영어로 자동 번역하여 국제 뉴스까지 검색하고, 영어로 검색하면 국내 뉴스도 함께 검색합니다.
              </CardDescription>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Naver Papago API를 활용한 자동 번역</li>
                <li>국내(네이버 뉴스) + 국제(RSS) 통합 검색</li>
                <li>검색 키워드는 OpenAI로 분석하여 통계 수집</li>
              </ul>
            </CardContent>
          </Card>

          {/* 이메일 구독 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>맞춤형 이메일 구독</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                관심 키워드를 등록하면 원하는 시간에 맞춤형 뉴스 다이제스트를 이메일로 받을 수 있습니다.
              </CardDescription>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>최대 3개 키워드 등록 가능</li>
                <li>배송 시간: 오전 6시, 낮 12시, 오후 6시 (KST)</li>
                <li>요일별 수신 설정 가능</li>
                <li>Resend API를 통한 예약 발송</li>
              </ul>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/mypage">마이페이지에서 설정하기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 북마크 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                <CardTitle>북마크</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                관심 있는 뉴스를 북마크하여 나중에 다시 읽을 수 있습니다.
              </CardDescription>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>각 뉴스 카드의 북마크 아이콘 클릭</li>
                <li>마이페이지에서 모든 북마크 관리</li>
                <li>로그인 필요</li>
              </ul>
            </CardContent>
          </Card>

          {/* 트렌딩 키워드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>트렌딩 키워드</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                실시간으로 많이 검색되는 키워드를 확인하고 클릭하여 바로 검색할 수 있습니다.
              </CardDescription>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>1시간, 24시간, 7일 단위 통계</li>
                <li>키워드 클릭 시 즉시 검색</li>
                <li>실시간 업데이트</li>
              </ul>
            </CardContent>
          </Card>

          {/* 다국어 뉴스 소스 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>다국어 뉴스 소스</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardDescription>
                국내외 주요 언론사의 뉴스를 실시간으로 수집합니다.
              </CardDescription>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">국제 (RSS)</h4>
                  <p className="text-xs text-muted-foreground">
                    BBC, CNN, The Guardian, New York Times, Reuters, Al Jazeera, NPR
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">국내 (Naver News API)</h4>
                  <p className="text-xs text-muted-foreground">
                    네이버 뉴스 검색을 통한 실시간 국내 뉴스
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">💡 사용 팁</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>카테고리와 지역 필터를 조합하여 원하는 뉴스만 모아보세요</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>시간 범위 슬라이더로 최신 뉴스부터 48시간 전 뉴스까지 조회 가능합니다</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>그리드/리스트/컴팩트 뷰 전환으로 선호하는 레이아웃을 선택하세요</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>다크 모드를 지원하여 눈의 피로를 줄일 수 있습니다</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>마이페이지에서 내 활동 통계를 확인하세요 (요약 횟수, 클릭 수, 검색 수)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8 space-y-4">
          <Button asChild size="lg">
            <Link href="/">뉴스 보러 가기</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            문의사항이 있으시면{" "}
            <a href="https://github.com/anthropics/claude-code/issues" className="text-primary hover:underline">
              GitHub Issues
            </a>
            를 이용해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

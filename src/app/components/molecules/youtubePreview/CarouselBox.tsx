'use client'

import { useEffect, useRef, useState } from 'react'
import CarouselItem from '../../atoms/youtubePreview/CarouselItem'
import CarouselLoading from '../../atoms/youtubePreview/CarouselLoading'
import { useInfinitePlaylist } from '@/app/api/getYoutubePlayList'
import { useSetAtom } from 'jotai'
import videoAtom from '@/app/store/videoAtom'
import CarouselArrow from '../../atoms/youtubePreview/CarouselArrow'

// Carousel을 나열하는 Box
// Carouselを羅列するBox
const CarouselBox = () => {
  // 데이터 취득infiniteQuery
  // データ取得のinfiniteQuery
  const { data, isLoading, fetchNextPage, isFetching, hasNextPage, error } =
    useInfinitePlaylist()

  const ref = useRef<HTMLDivElement>(null)
  const [isReadyFetch, setIsReadyFetch] = useState(false)
  const setVideoId = useSetAtom(videoAtom)
  const [isFirstRender, setIsFirstRender] = useState(true)

  // mouse event
  const [isClicked, setIsClicked] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // 데이터 페이지 끝에 도달하면 다음 페이지 데이터 가져오기
  // データページの最後に達したら次のページのデータを取得
  useEffect(() => {
    if (isReadyFetch && fetchNextPage && !isFetching && hasNextPage) {
      fetchNextPage()
      setIsReadyFetch(false)
    }
  }, [isReadyFetch, fetchNextPage, isFetching, hasNextPage])

  // scroll상태를 감시
  // scroll状態を監視
  useEffect(() => {
    const scrollContainer = ref.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft
      const scrollWidth = scrollContainer.scrollWidth
      const width = scrollContainer.clientWidth
      const scrollRight = width + scrollLeft

      // scroll상태확인 log
      // scroll状態の確認Log
      // console.log('scrollRight', scrollRight)
      // console.log('scrollWidth', scrollWidth)

      // 오른쪽 끝에 도달하면 fetch실행
      // 右端に到達したらfetchを実行
      const isAtEnd = Math.abs(scrollWidth - scrollRight) < 10
      setIsReadyFetch(isAtEnd)
    }

    if (!isLoading && !isFetching && data) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [ref, isLoading, isFetching, data])

  // mouse down
  const dragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    setIsClicked(true)
    setStartX(e.pageX)
    setScrollLeft(ref.current.scrollLeft)
  }

  // mouse move
  const dragMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClicked || !ref.current) return
    e.preventDefault()
    const move = e.pageX - startX
    ref.current.scrollLeft = scrollLeft - move
  }

  // mouse up or leave
  const dragMouseEnd = () => {
    setIsClicked(false)
  }

  // 초회 렌더링시 player의 데이터 세팅
  // 初回レンダリング時playerのデータをセッティング
  useEffect(() => {
    if (!isFirstRender) return

    if (data) {
      setVideoId({
        title: data.pages[0].items[0].snippet.title,
        videoId: data.pages[0].items[0].snippet.resourceId.videoId,
        videoOwnerTitle: data.pages[0].items[0].snippet.channelTitle,
        videoPublishDate: data.pages[0].items[0].snippet.publishedAt,
      })
      setIsFirstRender(false)
    }
  }, [data])

  if (error) {
    alert('error get youtube')
  }

  // Carousel Move Left
  const handleLeftClick = () => {
    const scrollContainer = ref.current
    if (!scrollContainer) return

    const scrollLeft = scrollContainer.scrollLeft
    if (scrollLeft === 0) return

    scrollContainer.scrollLeft = scrollLeft - 328
  }

  // Carousel Move Right
  const handleRightClick = () => {
    const scrollContainer = ref.current
    if (!scrollContainer) return

    const width = scrollContainer.clientWidth
    const scrollLeft = scrollContainer.scrollLeft
    if (scrollLeft + 320 === width) return

    scrollContainer.scrollLeft = scrollLeft + 328
  }

  return (
    <>
      {isLoading ? (
        <CarouselLoading />
      ) : (
        <div className="w-full h-[220px] border-red-600 border-2 bg-red-600 rounded-md ">
          <div className="relative w-full h-full border-black border-2 bg-slate-800 rounded-md overflow-hidden">
            <div
              ref={ref}
              className="h-full p-1 flex flex-nowrap gap-2 items-center
               overflow-x-auto scrollbar-hide
               cursor-grab active:cursor-grabbing select-none
               "
              onMouseDown={dragMouseDown}
              onMouseMove={dragMouseMove}
              onMouseUp={dragMouseEnd}
              onMouseLeave={dragMouseEnd}
            >
              {data &&
                data.pages.map((page) =>
                  page.items.map((item) => (
                    <CarouselItem key={item.id} data={item} />
                  )),
                )}
            </div>
            <CarouselArrow direction="left" onClick={handleLeftClick} />
            <CarouselArrow direction="right" onClick={handleRightClick} />
          </div>
        </div>
      )}
    </>
  )
}

export default CarouselBox

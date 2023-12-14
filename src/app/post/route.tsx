import { ImageResponse } from 'next/og'
import qs from 'qs'
import dayjs from 'dayjs'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const slug = searchParams.get('slug')
        const postParams = qs.stringify(
            {
                populate: ['post_tags', 'post_category', 'authors.avatar'],
                filters: {
                    slug: {
                        $eq: slug,
                    },
                },
            },
            { encodeValuesOnly: true }
        )
        const questionParams = qs.stringify(
            {
                populate: ['profile.avatar'],
                filters: {
                    slugs: {
                        slug,
                    },
                },
            },
            { encodeValuesOnly: true }
        )
        const {
            data: [{ attributes: post }],
        } = await fetch(`https://squeak.posthog.cc/api/posts?${postParams}`).then((res) => res.json())
        const { data: comments } = await fetch(`https://squeak.posthog.cc/api/questions?${questionParams}`).then(
            (res) => res.json()
        )
        const header = await fetch(new URL('../../../assets/header.jpg', import.meta.url)).then((res) =>
            res.arrayBuffer()
        )
        const fontData = await fetch(`https://d1sdjtjk6xzm7.cloudfront.net/Matter-SemiBold.ttf`, {
            headers: {
                origin: 'https://app.posthog.com',
                referer: 'https://app.posthog.com/',
            },
        }).then((res) => res.arrayBuffer())

        const category = post.post_category.data.attributes.label
        const tag = post.post_tags.data?.[0]?.attributes.label
        const authors = post.authors.data
        const { excerpt, title, date } = post
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                        backgroundColor: '#EEEFE9',
                        fontFamily: '"Matter"',
                    }}
                >
                    <img src={header} />
                    <div tw="flex items-center justify-between p-8 border-b border-[#D0D1C9]">
                        <div tw="flex">
                            <p tw="m-0 text-3xl mr-4">{category}</p>
                            <p tw="m-0 text-3xl opacity-50 mr-4">/</p>
                            <p tw="m-0 text-3xl opacity-80">{tag}</p>
                        </div>
                        <p tw="m-0 text-3xl opacity-80">{dayjs(date).format('MMM D, YYYY')}</p>
                    </div>
                    <div tw="flex px-12 mt-8">
                        <div tw="flex flex-col flex-shrink-0 mr-8 relative">
                            <div tw="flex flex-shrink-0">
                                {[authors[0]].map(({ id, attributes: { avatar } }) => {
                                    const imageURL = avatar?.data?.attributes?.url
                                    return (
                                        imageURL && (
                                            <div tw="w-[70px] h-[70px] flex justify-center items-center rounded-full border border-[#D0D1C9] overflow-hidden">
                                                <img key={id} src={imageURL} tw="absolute inset-0 z-10" />
                                            </div>
                                        )
                                    )
                                })}
                            </div>
                            {comments?.length > 0 && (
                                <div
                                    style={{
                                        transform: 'translateX(50%)',
                                        marginTop: -5,
                                        borderBottomRightRadius: '0px',
                                    }}
                                    tw="flex-grow w-[70px] border-[#D0D1C9] border-l border-b rounded-md"
                                />
                            )}
                        </div>
                        <div tw="flex flex-col max-w-[980px]">
                            <h1
                                style={{
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.4,
                                }}
                                tw="m-0 text-5xl"
                            >
                                {title}
                            </h1>
                            <p
                                style={{ maxHeight: 250 }}
                                tw="m-0 text-4xl leading-[1.5] mt-3 overflow-hidden opacity-70"
                            >
                                {excerpt}
                            </p>
                            {comments?.length > 0 ? (
                                <div tw="flex items-center" style={{ transform: 'translateY(50%)' }}>
                                    <div tw="flex mr-8">
                                        {comments.map(
                                            ({
                                                attributes: {
                                                    profile: {
                                                        data: {
                                                            attributes: { avatar, gravatarURL },
                                                        },
                                                    },
                                                },
                                            }) => {
                                                const imageURL =
                                                    avatar?.data?.attributes?.formats?.small?.url || gravatarURL
                                                return imageURL ? (
                                                    <img
                                                        key={imageURL}
                                                        src={imageURL}
                                                        tw="w-[50px] h-[50px] rounded-full -mr-4"
                                                    />
                                                ) : (
                                                    <svg
                                                        style={{ marginRight: '-1rem' }}
                                                        width="50"
                                                        height="50"
                                                        viewBox="0 0 50 50"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g clip-path="url(#clip0_10188_141315)">
                                                            <path
                                                                d="M0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 38.8071 38.8071 50 25 50C11.1929 50 0 38.8071 0 25Z"
                                                                fill="#E5E7E0"
                                                            />
                                                            <path
                                                                fill-rule="evenodd"
                                                                clip-rule="evenodd"
                                                                d="M26.4875 8.21248C19.7575 7.34248 14.065 13.075 14.075 21.1412C14.0913 21.2662 14.1075 21.4275 14.1275 21.6137C14.1838 22.1675 14.265 22.9475 14.455 23.7012C15.5588 28.0075 17.9313 31.2975 22.3363 32.6162C26.2325 33.7887 29.6613 32.6662 32.5113 29.8137C36.2713 26.0437 37.2675 19.765 34.875 14.755C33.175 11.2 30.52 8.72998 26.4875 8.21248ZM3.12503 50C2.32503 47.685 4.52378 41.9325 6.80878 40.4875C9.90878 38.5337 13.1538 36.81 16.3975 35.0875C16.9975 34.7687 17.5975 34.45 18.195 34.13C18.5863 33.925 19.3188 34.14 19.8075 34.365C23.3413 35.9175 26.8375 35.9275 30.3925 34.4025C31.0075 34.14 31.945 34.1012 32.5113 34.3837C35.8713 36.0925 39.2013 37.8512 42.4625 39.735C45.4025 41.435 47.9 47.305 46.875 50H3.12503Z"
                                                                fill="white"
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_10188_141315">
                                                                <rect width="50" height="50" rx="25" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                )
                                            }
                                        )}
                                    </div>
                                    <p tw="m-0 text-2xl opacity-70">{comments.length} comments</p>
                                </div>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        data: fontData,
                        name: 'Matter',
                    },
                ],
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}

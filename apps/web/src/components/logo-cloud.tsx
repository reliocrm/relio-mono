import { InfiniteSlider } from '@/components/motion/infinite-slider'
import { ProgressiveBlur } from '@/components/motion/progressive-blur'

const ITEMS = [
	{
		name: "CBRE",
		src: "/images/logos/cbre.png",
		width: 143,
		height: 28,
		href: "https://cbre.com",
	},
	{
		name: "Colliers",
		src: "/images/logos/colliers.png",
		width: 154,
		height: 28,
		href: "https://colliers.com",
	},
	{
		name: "Remax",
		src: "/images/logos/remax.png",
		width: 113,
		height: 28,
		href: "https://remax.com",
	},
	{
		name: "Cushman Wakefield",
		src: "/images/logos/cw.png",
		width: 112,
		height: 28,
		href: "https://cushmanwakefield.com",
	},
	{
		name: "Exp Realty",
		src: "/images/logos/exp.png",
		width: 141,
		height: 28,
		href: "https://exprealty.com",
	},
	{
		name: "JLL",
		src: "/images/logos/jll.png",
		width: 104,
		height: 28,
		href: "https://jll.com",
	},
	{
		name: "Keller Williams",
		src: "/images/logos/kw.png",
		width: 105,
		height: 28,
		href: "https://kellerwilliams.com",
	},
	{
		name: "Marcus Millichap",
		src: "/images/logos/mm.jpeg",
		width: 128,
		height: 28,
		href: "https://marcusmillichap.com",
	},
	{
		name: "Newmark",
		src: "/images/logos/newmark.png",
		width: 90,
		height: 28,
		href: "https://www.nmrk.com/",
	},
];

export const LogoCloud = () => {
    return (
        <section className="bg-background pb-16 md:pb-32">
            <div className="group relative m-auto max-w-6xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="inline md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm">Powering the best teams</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
						{ITEMS.map((item) => (
							<a
								key={item.name}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex"
							>
								<img
									className="mx-auto h-6 w-auto grayscale opacity-80"
									src={item.src}
									alt={`${item.name} Logo`}
								/>
							</a>
						))}
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

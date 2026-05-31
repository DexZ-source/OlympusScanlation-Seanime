class Provider {

    constructor() {
        this.baseUrl = "https://olympusxyz.com"
        this.dashboardApi = "https://dashboard.olympusxyz.com"
        this.allSeries = []
        this.slugMap = {}
        this.seriesLoaded = false
        this.seriesLoading = false
    }

    getSettings() {
        return {
            supportsMultiLanguage: false,
            supportsMultiScanlator: false,
        }
    }

    async fetchJson(url) {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": `${this.baseUrl}/`,
            },
        })
        return response
    }

    async search(opts) {
        try {
            if (!this.seriesLoaded && !this.seriesLoading) {
                await this.loadAllSeries()
            }

            const query = opts.query.toLowerCase()
            const results = []

            for (const series of this.allSeries) {
                if (series.type !== "comic") continue
                const title = series.name
                if (title && title.toLowerCase().includes(query)) {
                    results.push({
                        id: String(series.id),
                        title,
                        image: series.cover || undefined,
                    })
                }
                if (results.length >= 25) break
            }

            return results
        } catch (e) {
            return []
        }
    }

    async findChapters(mangaId) {
        if (!this.seriesLoaded && !this.seriesLoading) {
            await this.loadAllSeries()
        }

        const slug = this.slugMap[mangaId]
        if (!slug) return []

        const chapters = []
        let page = 1

        while (true) {
            try {
                const url = `${this.dashboardApi}/api/series/${slug}/chapters?page=${page}&direction=desc&type=comic`
                const response = await this.fetchJson(url)
                if (!response.ok) break

                const data = await response.json()
                const chapterList = data.data || []

                for (const chapter of chapterList) {
                    const chapterId = chapter.id
                    const chapterNum = chapter.name

                    if (chapterId && chapterNum) {
                        chapters.push({
                            id: `${chapterId}:${slug}`,
                            url: `${this.baseUrl}/api/capitulo/comic-${slug}/${chapterId}`,
                            title: chapter.title || `Capítulo ${chapterNum}`,
                            chapter: String(chapterNum),
                            index: chapters.length,
                            language: "es",
                            scanlator: chapter.team?.name || undefined,
                            updatedAt: chapter.published_at ?? undefined,
                        })
                    }
                }

                const meta = data.meta || {}
                if (page >= (meta.last_page || 1)) break
                page++

                if (page > 100) break
            } catch (e) {
                break
            }
        }

        for (let i = 0; i < chapters.length; i++) {
            chapters[i].index = i
        }

        return chapters
    }

    async findChapterPages(chapterId) {
        try {
            const parts = chapterId.split(":")
            const chId = parts[0]
            const slug = parts[1]
            if (!chId || !slug) return []

            const url = `${this.baseUrl}/api/capitulo/comic-${slug}/${chId}`
            const response = await this.fetchJson(url)
            if (!response.ok) return []

            const data = await response.json()
            const pageList = data.chapter?.pages || []

            const pages = []
            for (let i = 0; i < pageList.length; i++) {
                if (pageList[i]) {
                    pages.push({
                        url: pageList[i],
                        index: i,
                        headers: {
                            "Referer": `${this.baseUrl}/`,
                        },
                    })
                }
            }

            return pages
        } catch (e) {
            return []
        }
    }

    async loadAllSeries() {
        this.seriesLoading = true
        this.allSeries = []
        this.slugMap = {}

        try {
            const response = await this.fetchJson(`${this.baseUrl}/api/series/list`)
            if (!response.ok) return

            const data = await response.json()
            this.allSeries = data.data || []

            for (const series of this.allSeries) {
                this.slugMap[String(series.id)] = series.slug
            }

            this.seriesLoaded = true
        } catch (error) {
            console.error("Error loading series:", error)
        } finally {
            this.seriesLoading = false
        }
    }
}

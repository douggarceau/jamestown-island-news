import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--allow-file-access-from-files'])
        pg=await b.new_page();await pg.goto('file:///tmp/claude-0/card/card.html');await pg.evaluate('document.fonts.ready');await pg.wait_for_timeout(800)
        await pg.pdf(path='/tmp/claude-0/card/card.pdf',width='14.25in',height='5.25in',print_background=True,prefer_css_page_size=True)
        await b.close()
asyncio.run(main())

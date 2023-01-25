
<script>
	const d = new Date();
	const year = d.getFullYear();
</script>

<style>
	a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
	.bg {
  background: rgb(46,46,48);
  background: radial-gradient(circle, rgba(38,38,42,1) 0%, rgba(32,32,36,1) 35%, rgba(22,22,26,1) 85%);
  position: absolute;
  pointer-events: none;
  z-index: -1;
  width: 100%;
  height: 200%;
  transform: translateY(-50%);
}

.container {
  padding: 0 var(--base-padding);
}

header {
  margin: 0 auto;
  max-width: 1120px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

header img {
  height: 28px;
}

nav {
  display: flex;
  align-items: center;
  grid-gap: 40px;
  color: var(--text1);
  font-weight: 500;
}

nav a:hover {
  color: var(--text0);
}

@media all and (max-width: 600px) {
  nav {
    grid-gap: 16px;
  }
}

.hero {
  text-align: center;
  padding-top: 64px;
  margin: 0 auto;
  max-width: 1120px;
}

h1,h2,h3,h4,h5 {
  margin: 0;
  padding: 0;
}

h1 {
  line-height: 1.218;
  margin: 24px auto;
  font-size: 64px;
  max-width: 900px;
  font-weight: 400;
  text-transform: uppercase;
}

@media all and (max-width: 600px) {
  h1 {
    font-size: 48px;
  }
}

h3 {
    margin: 0 auto;
    margin-bottom: 48px;
    font-size: 24px;
    line-height: 1.618;
    font-weight: 400;
    max-width: 460px;
}

.button-wrapper {
  margin-bottom: 32px;
}
.button {
  display: inline-block;
  padding: 20px 32px;
  border-radius: 50px;
  font-weight: 650;
  color: var(--primary-darkest);
  background-color: var(--primary);
  white-space: nowrap;
  font-size: 20px;
}
.button:hover {
  background-color: var(--primary-hover);
}

.note {
   margin-bottom: 64px;
   color: var(--text1);
   line-height: 1.318;
}

.stats {
  margin: 0 auto;
   margin-bottom: 96px;
   display: grid;
   grid-template-columns: 1fr 1fr 1fr 1fr;
   max-width: 1020px;
}

@media all and (max-width: 600px) {
  .stats {
    grid-template-columns: 100%;
    grid-template-rows: auto auto auto auto;
    grid-gap: 32px;
    height: auto;
    width: 100%;
    margin-bottom: 64px;
  }
}

.stat {
  padding: 20px;
}
.stat:last-child {
  border-right: none;
}

.stat .value {
  font-size: 38px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.stat .value.grayed {
  font-weight: 400;
  font-size: 18px;
  color: var(--text1);
}
.stat .value.grayed img {
  margin-right: 5px;
}

.stat .value img {
  height: 36px;
}

.stat .label {
  margin-top: 14px;
  font-size: 90%;
  letter-spacing: 0.02em;
}

.screen {
  margin: 0 auto;
  max-width: 1640px;
  margin-bottom: 128px;
}

.screen img {
  border-radius: 15px;
  width: 100%;
  box-shadow: 0 20px 40px rgb(28 28 28 / 50%);
  border: 2px solid rgb(60 60 60 / 50%);
}

.section {
  margin: 0 auto;
  max-width: 1120px;
  text-align: center;
  margin-bottom: 128px;
}

h2 {
  margin-bottom: 24px;
  font-size: 42px;
  font-weight: 650;
  line-height: 1.318;
  color: var(--text0);
}

h4 {
  font-size: 20px;
  line-height: 1.418;
  color: var(--text1);
  font-weight: 400;
  margin-bottom: 48px;
}

.grid {
  display: grid;
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
  grid-gap: 15px;
}

@media all and (max-width: 600px) {
  .grid {
    grid-template-columns: 100%;
    grid-template-rows: repeat(12, auto);
    height: auto;
    width: 100%;
  }
}

.box {
  background-color: var(--layer0-hover);
  border-radius: 15px;
  padding: 30px var(--base-padding);
}

.box .icon {
  margin-bottom: 20px;
}
.box .icon svg {
  fill: #21CC23;
}

.box .title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 12px;
}

.box .text {
  color: var(--text1);
  line-height: 1.418;
}

.partners {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin-bottom: 50px;
}
@media all and (max-width: 600px) {
  .partners {
    flex-direction: column;
  }
}

.partners img {
  min-height: 25px;
  max-height: 50px;
  filter: grayscale(100%);
}

footer {
  border-top: 1px solid var(--layer0-hover);
  padding: 64px 30px;
}

.footer-inner .logo img {
  height: 24px;
  filter: grayscale(100%);
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  margin: 0 auto;
  max-width: 1120px;
  grid-gap: 30px;
}

@media all and (max-width: 600px) {
  .footer-inner {
    grid-template-columns: 100%;
    grid-template-rows: repeat(5, auto);
    height: auto;
    width: 100%;
  }
}

.footer-inner .category {
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 110%;
}

.footer-inner .item {
  color: var(--text1);
  margin-bottom: 20px;
}
.footer-inner .item a:hover {
  color: var(--primary);
}
.footer-inner .grayed {
  opacity: 0.5;
  pointer-events: none;
}

.copyright {
  color: var(--text2);
  margin-top: 16px;
}
</style>

<div class='container'>

  <header>
    <img src='im/logo-full.svg'>
    <nav class='right'>
      <a href='/trade'>Trade</a>
      <a href='/pool'>Pool</a>
      <a href='/stake'>Stake</a>
      <a href='https://docs.cap.io'>Docs</a>
    </nav>
  </header>

  <div class='hero'>

    <h1>Decentralized <strong>Perps</strong></h1>

    <h3>Trade global markets with low fees, deep liquidity, and up to 100× leverage.</h3>

    <div class='button-wrapper'>
      <a class='button ' href='/trade'>Start Trading →</a>
    </div>

    <div class='note'>CAP is currently in public beta.</div>

    <div class='stats'>

      <div class='stat'>
        <div class='value' id='volumeValue'>$7B+</div>
        <div class='label'>Volume</div>
      </div>

      <div class='stat'>
        <div class='value'>
          30+
        </div>
        <div class='label'>Markets</div>
      </div>

      <div class='stat'>
        <div class='value'>1000s</div>
        <div class='label'>Of Traders</div>
      </div>

      <div class='stat'>
        <div class='value'><img src='im/arbitrum-logo.svg'></div>
        <div class='label'>Network</div>
      </div>

    </div>

  </div>

  <div class='screen'>
    <img src='im/dashboard.png' />
  </div>

  <div class='section'>

    <h2 data-textify>The Best Place To Trade</h2>

    <h4 data-textify>All the features you need for fast and secure on-chain trading.</h4>

    <div class='grid'>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 23.2812 20.3613" height="48">
            <path d="M2.27539 15.3223C1.8457 15.3223 1.57227 15.0488 1.57227 14.6191L1.57227 2.95898C1.57227 2.51953 1.8457 2.25586 2.27539 2.25586L21.0059 2.25586C21.4355 2.25586 21.709 2.51953 21.709 2.95898L21.709 14.6191C21.709 15.0488 21.4355 15.3223 21.0059 15.3223Z" fill="#ffffff" fill-opacity="0"/>
            <path d="M2.24609 16.8945L21.0254 16.8945C22.4316 16.8945 23.2812 16.0449 23.2812 14.6387L23.2812 2.92969C23.2812 1.52344 22.4316 0.683594 21.0254 0.683594L2.24609 0.683594C0.849609 0.683594 0 1.52344 0 2.92969L0 14.6387C0 16.0449 0.849609 16.8945 2.24609 16.8945ZM2.27539 15.3223C1.8457 15.3223 1.57227 15.0488 1.57227 14.6191L1.57227 2.95898C1.57227 2.51953 1.8457 2.25586 2.27539 2.25586L21.0059 2.25586C21.4355 2.25586 21.709 2.51953 21.709 2.95898L21.709 14.6191C21.709 15.0488 21.4355 15.3223 21.0059 15.3223ZM8.55469 19.2188L14.7266 19.2188L14.7266 16.7676L8.55469 16.7676ZM8.49609 20.3613L14.7852 20.3613C15.2148 20.3613 15.5664 20.0098 15.5664 19.5703C15.5664 19.1309 15.2148 18.7793 14.7852 18.7793L8.49609 18.7793C8.06641 18.7793 7.70508 19.1309 7.70508 19.5703C7.70508 20.0098 8.06641 20.3613 8.49609 20.3613Z" fill="#21CC23" />
          </svg>
        </div>
        <div class='title' data-textify>World-Class Platform</div>
        <div class='text' data-textify>CAP offers an intuitive interface with real time prices, charting, and more.</div>
      </div>

      <div class='box'>
        <div class='icon'>
      <svg viewBox="0 0 23.0273 17.998" height="48">
        <path d="M3.06641 17.998L19.9609 17.998C22.0117 17.998 23.0273 16.9824 23.0273 14.9707L23.0273 3.04688C23.0273 1.03516 22.0117 0.0195312 19.9609 0.0195312L3.06641 0.0195312C1.02539 0.0195312 0 1.02539 0 3.04688L0 14.9707C0 16.9922 1.02539 17.998 3.06641 17.998ZM3.08594 16.4258C2.10938 16.4258 1.57227 15.9082 1.57227 14.8926L1.57227 3.125C1.57227 2.10938 2.10938 1.5918 3.08594 1.5918L19.9414 1.5918C20.9082 1.5918 21.4551 2.10938 21.4551 3.125L21.4551 14.8926C21.4551 15.9082 20.9082 16.4258 19.9414 16.4258ZM7.44141 16.7285L8.97461 16.7285L8.97461 1.29883L7.44141 1.29883ZM3.59375 6.25977L5.43945 6.25977C5.68359 6.25977 5.87891 6.08398 5.87891 5.82031L5.87891 3.99414C5.87891 3.7207 5.69336 3.54492 5.43945 3.54492L3.59375 3.54492C3.32031 3.54492 3.13477 3.7207 3.13477 3.99414L3.13477 5.82031C3.13477 6.08398 3.33008 6.25977 3.59375 6.25977ZM3.59375 10.3613L5.43945 10.3613C5.68359 10.3613 5.87891 10.166 5.87891 9.92188L5.87891 8.07617C5.87891 7.82227 5.69336 7.62695 5.43945 7.62695L3.59375 7.62695C3.32031 7.62695 3.13477 7.82227 3.13477 8.07617L3.13477 9.92188C3.13477 10.166 3.33008 10.3613 3.59375 10.3613ZM3.59375 14.4434L5.43945 14.4434C5.68359 14.4434 5.87891 14.2676 5.87891 14.0039L5.87891 12.1777C5.87891 11.9141 5.69336 11.7285 5.43945 11.7285L3.59375 11.7285C3.32031 11.7285 3.13477 11.9141 3.13477 12.1777L3.13477 14.0039C3.13477 14.2676 3.33008 14.4434 3.59375 14.4434Z"/>
      </svg>
        </div>
        <div class='title'>30+ Markets</div>
        <div class='text'>Trade crypto, forex, commodities, and more using crypto collateral.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 21.582 19.9902" height="48">
            <path d="M5.72266 19.5801C6.07422 19.5801 6.35742 19.2969 6.35742 18.9355C6.35742 18.5742 6.07422 18.291 5.72266 18.291C5.36133 18.291 5.07812 18.5742 5.07812 18.9355C5.07812 19.2969 5.36133 19.5801 5.72266 19.5801ZM4.70703 17.7637C5.06836 17.7637 5.35156 17.4805 5.35156 17.1191C5.35156 16.7676 5.06836 16.4844 4.70703 16.4844C4.35547 16.4844 4.07227 16.7676 4.07227 17.1191C4.07227 17.4805 4.35547 17.7637 4.70703 17.7637ZM3.69141 15.957C4.05273 15.957 4.33594 15.6641 4.33594 15.3125C4.33594 14.9609 4.05273 14.668 3.69141 14.668C3.33984 14.668 3.05664 14.9609 3.05664 15.3125C3.05664 15.6641 3.33984 15.957 3.69141 15.957ZM2.66602 14.1602C3.02734 14.1602 3.31055 13.8672 3.31055 13.5156C3.31055 13.1641 3.02734 12.8711 2.66602 12.8711C2.31445 12.8711 2.03125 13.1641 2.03125 13.5156C2.03125 13.8672 2.31445 14.1602 2.66602 14.1602ZM1.66016 12.334C2.01172 12.334 2.29492 12.0508 2.29492 11.6992C2.29492 11.3379 2.01172 11.0547 1.66016 11.0547C1.30859 11.0547 1.01562 11.3379 1.01562 11.6992C1.01562 12.0508 1.30859 12.334 1.66016 12.334ZM0.644531 10.5273C0.996094 10.5273 1.2793 10.2441 1.2793 9.89258C1.2793 9.53125 0.996094 9.24805 0.644531 9.24805C0.283203 9.24805 0 9.53125 0 9.89258C0 10.2441 0.283203 10.5273 0.644531 10.5273ZM1.66016 8.7207C2.01172 8.7207 2.29492 8.4375 2.29492 8.08594C2.29492 7.72461 2.01172 7.44141 1.66016 7.44141C1.30859 7.44141 1.01562 7.72461 1.01562 8.08594C1.01562 8.4375 1.30859 8.7207 1.66016 8.7207ZM2.66602 6.9043C3.02734 6.9043 3.31055 6.62109 3.31055 6.25977C3.31055 5.9082 3.02734 5.625 2.66602 5.625C2.31445 5.625 2.03125 5.9082 2.03125 6.25977C2.03125 6.62109 2.31445 6.9043 2.66602 6.9043ZM3.69141 5.10742C4.05273 5.10742 4.33594 4.81445 4.33594 4.46289C4.33594 4.11133 4.05273 3.81836 3.69141 3.81836C3.33984 3.81836 3.05664 4.11133 3.05664 4.46289C3.05664 4.81445 3.33984 5.10742 3.69141 5.10742ZM4.70703 3.28125C5.06836 3.28125 5.35156 2.99805 5.35156 2.64648C5.35156 2.28516 5.06836 2.00195 4.70703 2.00195C4.35547 2.00195 4.07227 2.28516 4.07227 2.64648C4.07227 2.99805 4.35547 3.28125 4.70703 3.28125ZM5.72266 1.47461C6.07422 1.47461 6.35742 1.19141 6.35742 0.839844C6.35742 0.478516 6.07422 0.195312 5.72266 0.195312C5.36133 0.195312 5.07812 0.478516 5.07812 0.839844C5.07812 1.19141 5.36133 1.47461 5.72266 1.47461Z" fill="#21CC23" />
            <path d="M10.498 19.9805C10.8984 19.9805 11.2207 19.6875 11.3574 19.4141L6.11328 10.3613C6.03516 10.2246 5.97656 10.0977 5.97656 9.99023C5.97656 9.88281 6.03516 9.75586 6.11328 9.61914L11.3574 0.566406C11.2207 0.292969 10.8984 0 10.498 0C10.1953 0 9.85352 0.175781 9.63867 0.537109L4.6875 8.92578C4.43359 9.33594 4.26758 9.62891 4.26758 9.99023C4.26758 10.3418 4.43359 10.6445 4.6875 11.0547L9.64844 19.4434C9.87305 19.8145 10.1953 19.9805 10.498 19.9805Z" fill="#21CC23" />
            <path d="M15.3809 19.9707C15.918 19.9707 16.2695 19.6582 16.7285 18.877L21.1816 11.2305C21.4551 10.7617 21.582 10.3809 21.582 9.99023C21.582 9.58984 21.4551 9.21875 21.1816 8.75L16.7285 1.10352C16.2695 0.322266 15.918 0.00976562 15.3809 0.00976562C14.8438 0.00976562 14.4922 0.322266 14.0234 1.10352L9.58008 8.75C9.29688 9.21875 9.17969 9.58984 9.17969 9.99023C9.17969 10.3809 9.30664 10.7617 9.58008 11.2305L14.0234 18.877C14.4922 19.6582 14.8438 19.9707 15.3809 19.9707Z" fill="#21CC23" />
          </svg>

        </div>
        <div class='title'>Multi-Collateral</div>
        <div class='text'>Use ETH or USDC as margin when placing trades.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 23.0273 17.9785" height="48">
            <path d="M4.98047 4.92188L13.2422 4.92188C13.5938 4.92188 13.8477 4.6582 13.8477 4.31641C13.8477 3.98438 13.5938 3.7207 13.2422 3.7207L4.98047 3.7207C4.62891 3.7207 4.375 3.98438 4.375 4.31641C4.375 4.6582 4.62891 4.92188 4.98047 4.92188ZM4.98047 14.248L13.2422 14.248C13.5938 14.248 13.8477 13.9941 13.8477 13.6621C13.8477 13.3203 13.5938 13.0469 13.2422 13.0469L4.98047 13.0469C4.62891 13.0469 4.375 13.3203 4.375 13.6621C4.375 13.9941 4.62891 14.248 4.98047 14.248ZM3.06641 17.9785L19.9609 17.9785C22.0117 17.9785 23.0273 16.9727 23.0273 14.9609L23.0273 3.02734C23.0273 1.01562 22.0117 0 19.9609 0L3.06641 0C1.02539 0 0 1.01562 0 3.02734L0 14.9609C0 16.9727 1.02539 17.9785 3.06641 17.9785ZM3.08594 16.4062C2.10938 16.4062 1.57227 15.8887 1.57227 14.873L1.57227 3.11523C1.57227 2.09961 2.10938 1.57227 3.08594 1.57227L19.9414 1.57227C20.9082 1.57227 21.4551 2.09961 21.4551 3.11523L21.4551 14.873C21.4551 15.8887 20.9082 16.4062 19.9414 16.4062Z" fill="#21CC23"/>
            <path d="M4.11133 11.2891L18.9258 11.2891C19.7363 11.2891 20.2148 10.7812 20.2148 9.98047L20.2148 7.98828C20.2148 7.1875 19.7363 6.67969 18.9258 6.67969L4.11133 6.67969C3.30078 6.67969 2.82227 7.1875 2.82227 7.98828L2.82227 9.98047C2.82227 10.7812 3.30078 11.2891 4.11133 11.2891Z" fill="#21CC23" />
            <path d="M4.99023 9.58984C4.63867 9.58984 4.375 9.32617 4.375 8.98438C4.375 8.65234 4.63867 8.38867 4.99023 8.38867L9.79492 8.38867C10.1465 8.38867 10.4004 8.65234 10.4004 8.98438C10.4004 9.32617 10.1465 9.58984 9.79492 9.58984Z" fill="rgb(38,38,40)"/>
          </svg>

        </div>
        <div class='title' data-textify>Advanced Order Types</div>
        <div class='text' data-textify>CAP supports market, limit, stop, reduce-only, and OCO orders.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 23.9551 22.6904"  height="48">
            <path d="M0.703125 13.2349L3.56445 13.2349C3.82812 13.2349 4.07227 13.0786 4.14062 12.7954L4.59961 10.7642L4.25781 10.7642L5.80078 17.9126C5.92773 18.4985 6.88477 18.4985 6.97266 17.9028L8.16406 10.0708L9.56055 22.1509C9.64844 22.8735 10.6836 22.8638 10.7422 22.1509L12.0215 7.74658L13.3105 22.1411C13.3691 22.8735 14.4043 22.8735 14.4922 22.1411L15.8887 10.0708L17.0801 17.9126C17.1777 18.5083 18.125 18.5083 18.252 17.9126L19.7852 10.813L19.4141 10.8228L19.9121 12.7954C20 13.1177 20.2246 13.2349 20.4883 13.2349L23.2617 13.2349C23.6523 13.2349 23.9551 12.9321 23.9551 12.5513C23.9551 12.1704 23.6523 11.8579 23.2617 11.8579L20.918 11.8579L20.1367 8.83057C19.9609 8.17627 19.1113 8.17627 18.9648 8.83057L17.7637 14.5337L16.3867 5.53955C16.2793 4.82666 15.293 4.84619 15.2051 5.54932L13.9746 16.2231L12.627 0.98877C12.5586 0.256348 11.4941 0.256348 11.4258 0.98877L10.0781 16.2231L8.84766 5.54932C8.75977 4.82666 7.77344 4.82666 7.66602 5.53955L6.28906 14.5337L5.08789 8.83057C4.95117 8.2251 4.08203 8.2251 3.91602 8.83057L3.13477 11.8579L0.703125 11.8579C0.302734 11.8579 0 12.1704 0 12.5513C0 12.9321 0.302734 13.2349 0.703125 13.2349Z" fill="#21CC23"/>
          </svg>

        </div>
        <div class='title' data-textify>Risk Management</div>
        <div class='text' data-textify>Set a take-profit or stop-loss to automatically manage your trade risk.</div>
      </div>

      <div class='box'>
        <div class='icon'>
            <svg viewBox="0 0 13.7598 21.9778" height="48">
              <path d="M0 12.1168C0 12.4977 0.292969 12.7809 0.703125 12.7809L6.2207 12.7809L3.31055 20.6911C2.92969 21.6969 3.97461 22.234 4.62891 21.4137L13.5059 10.32C13.6719 10.1149 13.7598 9.91958 13.7598 9.69497C13.7598 9.32388 13.4668 9.03091 13.0566 9.03091L7.53906 9.03091L10.4492 1.12075C10.8301 0.114895 9.78516-0.422214 9.13086 0.407864L0.253906 11.4918C0.0878906 11.7067 0 11.902 0 12.1168Z" fill="#21CC23"/>
            </svg>
        </div>
        <div class='title' data-textify>Dynamic Funding</div>
        <div class='text' data-textify>Longs pay shorts (and vice versa) based on open interest imbalance.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 23.0273 23.877" height="48">
            <path d="M11.5137 23.877C11.9434 23.877 12.3047 23.5156 12.3047 23.0859L12.3047 0.78125C12.3047 0.351562 11.9434 0 11.5137 0C11.084 0 10.7324 0.351562 10.7324 0.78125L10.7324 23.0859C10.7324 23.5156 11.084 23.877 11.5137 23.877ZM4.30664 13.1445C4.9707 13.1445 5.48828 12.5977 5.48828 11.9336C5.48828 11.2695 4.9707 10.7227 4.30664 10.7227C3.64258 10.7227 3.0957 11.2695 3.0957 11.9336C3.0957 12.5977 3.64258 13.1445 4.30664 13.1445ZM7.82227 13.1445C8.48633 13.1445 9.01367 12.5977 9.01367 11.9336C9.01367 11.2695 8.48633 10.7227 7.82227 10.7227C7.16797 10.7227 6.62109 11.2695 6.62109 11.9336C6.62109 12.5977 7.16797 13.1445 7.82227 13.1445ZM14.7754 13.9258C14.7656 14.2188 15.0977 14.3066 15.2832 14.1211L16.4453 12.9785L17.7344 16.1621C17.7832 16.2988 17.9492 16.3672 18.0859 16.3184L18.8281 16.0156C18.9551 15.9668 19.0039 15.8105 18.9355 15.6641L17.5684 12.5098L19.2188 12.4609C19.4922 12.4512 19.6289 12.168 19.4238 11.9629L15.3125 7.72461C15.1172 7.5293 14.834 7.62695 14.834 7.91016Z" fill="#21CC23" />
            <path d="M3.06641 20.9375L9.39453 20.9375L9.39453 19.3652L3.08594 19.3652C2.10938 19.3652 1.57227 18.8477 1.57227 17.832L1.57227 6.06445C1.57227 5.04883 2.12891 4.53125 3.08594 4.53125L9.39453 4.53125L9.39453 2.95898L3.06641 2.95898C1.01562 2.95898 0 3.96484 0 5.98633L0 17.9102C0 19.9316 1.02539 20.9375 3.06641 20.9375ZM13.6328 20.9375L19.9609 20.9375C22.002 20.9375 23.0273 19.9316 23.0273 17.9102L23.0273 5.98633C23.0273 3.96484 22.0117 2.95898 19.9609 2.95898L13.6328 2.95898L13.6328 4.53125L19.9414 4.53125C20.9082 4.53125 21.4551 5.04883 21.4551 6.06445L21.4551 17.832C21.4551 18.8477 20.918 19.3652 19.9414 19.3652L13.6328 19.3652Z" fill="#21CC23" />
          </svg>

        </div>
        <div class='title' data-textify>Adjustable Leverage</div>
        <div class='text' data-textify>Fine tune your leverage level on every order you submit, up to 100×.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 20.0684 21.2402" height="48">
            <path d="M2.96875 21.2305L17.0996 21.2305C19.0625 21.2305 20.0684 20.2344 20.0684 18.291L20.0684 8.4668C20.0684 6.52344 19.0625 5.53711 17.0996 5.53711L2.96875 5.53711C0.986328 5.53711 0 6.52344 0 8.4668L0 18.291C0 20.2344 0.986328 21.2305 2.96875 21.2305ZM1.86523 3.96484L18.2129 3.96484C18.0664 3.07617 17.6465 2.58789 16.6699 2.58789L3.4082 2.58789C2.43164 2.58789 2.01172 3.07617 1.86523 3.96484ZM3.87695 1.25977L16.2012 1.25977C16.1426 0.429688 15.6738 0 14.7656 0L5.30273 0C4.4043 0 3.93555 0.429688 3.87695 1.25977Z" fill="#21CC23"/>
            <path d="M6.40625 17.3633L6.40625 13.3594C6.40625 12.6465 6.69922 12.2949 7.28516 12.2559L7.28516 11.0742C7.28516 9.21875 8.39844 7.96875 10.0391 7.96875C11.6797 7.96875 12.793 9.21875 12.793 11.0742L12.793 12.2559C13.3789 12.2949 13.6719 12.6465 13.6719 13.3594L13.6719 17.3633C13.6719 18.1152 13.3398 18.4668 12.6465 18.4668L7.43164 18.4668C6.73828 18.4668 6.40625 18.1152 6.40625 17.3633ZM8.33984 12.2461L11.7383 12.2461L11.7383 10.957C11.7383 9.77539 11.0547 8.98438 10.0391 8.98438C9.02344 8.98438 8.33984 9.77539 8.33984 10.957Z" fill="rgb(38,38,40)" />
          </svg>
        </div>
        <div class='title' data-textify>Industry-Leading Security</div>
        <div class='text' data-textify>$0 hacked or lost since CAP first launched in 2020.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 21.8189 22.8003" height="48">
            <path d="M14.7778 18.4851L4.33839 8.02613L1.05714 11.2976C-0.339343 12.6941-0.36864 14.1394 1.06691 15.5652L7.24855 21.7371C8.68409 23.1628 10.1196 23.1433 11.5161 21.7468ZM7.04347 5.32105L17.4829 15.7605L21.0376 12.2058C21.77 11.4734 21.8189 11.0535 21.8189 10.0281L21.8189 6.31714C21.8189 5.28199 21.5747 4.95972 20.8325 4.21753L18.5864 1.97144C17.854 1.23902 17.5318 0.985111 16.4966 0.985111L12.7759 0.985111C11.7505 0.985111 11.3403 1.03394 10.6079 1.76636ZM14.856 8.79761C14.0845 8.79761 13.5181 8.20191 13.5181 7.45972C13.5181 6.70777 14.0845 6.12183 14.856 6.12183C15.6177 6.12183 16.1939 6.70777 16.1939 7.45972C16.1939 8.20191 15.6177 8.79761 14.856 8.79761Z" fill="#21CC23"/>
            <path d="M18.8599 20.8972C19.1626 21.1902 19.6411 21.1902 19.9243 20.8972C20.2075 20.6043 20.2173 20.1257 19.9243 19.8328L2.9712 2.87964C2.67824 2.58667 2.19972 2.57691 1.89699 2.87964C1.61378 3.16284 1.61378 3.65113 1.89699 3.94409Z" fill="#21CC23"/>
          </svg>

        </div>
        <div class='title' data-textify>Low Fees</div>
        <div class='text' data-textify>Get superior trade execution with low fees and zero slippage.</div>
      </div>

      

       <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 19.8926 18.6646" height="48">
            <path d="M8.22266 9.22978C10.3223 9.22978 12.1289 7.35478 12.1289 4.91338C12.1289 2.50127 10.3125 0.714159 8.22266 0.714159C6.13281 0.714159 4.31641 2.54033 4.31641 4.93291C4.31641 7.35478 6.13281 9.22978 8.22266 9.22978ZM1.66992 18.2728L14.6777 18.2728C14.5605 18.0384 14.502 17.7845 14.502 17.511L14.502 13.8294C14.043 13.4681 13.6816 13.0091 13.4277 12.4915C12.0996 11.5931 10.332 10.9778 8.22266 10.9778C3.1543 10.9778 0 14.4544 0 16.9739C0 17.7845 0.625 18.2728 1.66992 18.2728Z" />
            <path d="M16.9238 7.13994C15.2539 7.13994 13.9355 8.46807 13.9355 10.1087C13.9355 11.3685 14.6875 12.4524 15.8301 12.9017L15.8301 17.511C15.8301 17.6282 15.8887 17.7063 15.9668 17.804L16.748 18.595C16.8359 18.6829 16.9727 18.6927 17.0801 18.595L18.5547 17.1106C18.6621 17.013 18.6621 16.886 18.5547 16.7884L17.6367 15.8606L18.916 14.6204C19.0039 14.5228 18.9941 14.3958 18.8965 14.2786L17.6465 13.0286C19.082 12.4524 19.8926 11.3978 19.8926 10.1087C19.8926 8.46807 18.5645 7.13994 16.9238 7.13994ZM16.9141 8.56572C17.4121 8.56572 17.8223 8.98564 17.8223 9.47393C17.8223 10.0013 17.4121 10.4114 16.9141 10.4114C16.4062 10.4114 15.9863 10.0013 15.9863 9.47393C15.9863 8.98564 16.3965 8.56572 16.9141 8.56572Z" />
          </svg>
        </div>
        <div class='title' data-textify>Self Custody</div>
        <div class='text' data-textify>Your keys, your coins. Trade directly from your wallet, no deposits required.</div>
      </div>

      <div class='box'>
        <div class='icon'>
        <svg viewBox="0 0 17.9785 17.998" height="48">
          <path d="M3.06641 17.998L14.9121 17.998C16.9629 17.998 17.9785 16.9824 17.9785 14.9707L17.9785 3.04688C17.9785 1.03516 16.9629 0.0195312 14.9121 0.0195312L3.06641 0.0195312C1.02539 0.0195312 0 1.02539 0 3.04688L0 14.9707C0 16.9922 1.02539 17.998 3.06641 17.998Z"/>
          <path d="M7.00195 14.4922C5.64453 14.4922 4.83398 13.7109 4.83398 12.1387L4.83398 10.8887C4.83398 10.166 4.6582 9.99023 4.16016 9.85352C3.31055 9.62891 3.31055 8.37891 4.16016 8.1543C4.6582 8.02734 4.83398 7.85156 4.83398 7.12891L4.83398 5.87891C4.83398 4.30664 5.64453 3.51562 7.00195 3.51562C7.60742 3.51562 7.94922 3.80859 7.94922 4.21875C7.94922 4.62891 7.64648 4.88281 7.24609 4.88281C6.5625 4.88281 6.30859 5.18555 6.30859 6.01562L6.30859 7.38281C6.30859 8.28125 5.75195 8.93555 4.84375 9.0918L4.84375 8.90625C5.75195 9.07227 6.30859 9.72656 6.30859 10.625L6.30859 12.002C6.30859 12.832 6.5625 13.125 7.24609 13.125C7.64648 13.125 7.94922 13.3887 7.94922 13.7988C7.94922 14.209 7.60742 14.4922 7.00195 14.4922ZM11.0059 14.4922C10.4004 14.4922 10.0586 14.209 10.0586 13.7988C10.0586 13.3887 10.3613 13.125 10.7617 13.125C11.4453 13.125 11.6992 12.832 11.6992 12.002L11.6992 10.625C11.6992 9.72656 12.2559 9.07227 13.1641 8.90625L13.1641 9.0918C12.2559 8.93555 11.6992 8.28125 11.6992 7.38281L11.6992 6.01562C11.6992 5.18555 11.4453 4.88281 10.7617 4.88281C10.3613 4.88281 10.0586 4.62891 10.0586 4.21875C10.0586 3.80859 10.4004 3.51562 11.0059 3.51562C12.3633 3.51562 13.1738 4.30664 13.1738 5.87891L13.1738 7.12891C13.1738 7.85156 13.3496 8.02734 13.8477 8.1543C14.6973 8.36914 14.6973 9.63867 13.8477 9.85352C13.3496 9.99023 13.1738 10.166 13.1738 10.8887L13.1738 12.1387C13.1738 13.7109 12.3633 14.4922 11.0059 14.4922Z" fill="rgb(38,38,40)"/>
        </svg>
        </div>
        <div class='title' data-textify>Developer APIs</div>
        <div class='text' data-textify>Quickly automate your trading with CAP's easy-to-use API.</div>
      </div>

      <div class='box'>
        <div class='icon'>
          <svg viewBox="0 0 22.4902 17.9395" height="48">
            <path d="M5.50781 0C3.35938 0 1.12305 0.996094 0.117188 2.72461C0.00976562 2.91992 0 3.04688 0 3.4082L0 17.1875C0 17.6367 0.283203 17.9102 0.771484 17.9102C1.00586 17.9102 1.23047 17.8418 1.40625 17.6758C2.63672 16.6211 4.26758 16.0742 5.89844 16.0742C7.42188 16.0742 8.83789 16.6113 9.87305 17.5C9.98047 17.5879 10.1074 17.6367 10.2148 17.6367C10.4297 17.6367 10.6055 17.4805 10.6055 17.2266L10.6055 2.7832C10.6055 2.5293 10.5859 2.4707 10.4004 2.20703C9.44336 0.830078 7.56836 0 5.50781 0ZM16.9824 0C14.9219 0 13.0469 0.830078 12.0898 2.20703C11.9043 2.4707 11.8848 2.5293 11.8848 2.7832L11.8848 17.2266C11.8848 17.4805 12.0605 17.6367 12.2754 17.6367C12.3828 17.6367 12.5195 17.5879 12.6172 17.5C13.6523 16.6113 15.0684 16.0742 16.5918 16.0742C18.2227 16.0742 19.8535 16.6211 21.084 17.6758C21.2598 17.8418 21.4844 17.9102 21.7188 17.9102C22.207 17.9102 22.4902 17.6367 22.4902 17.1875L22.4902 3.4082C22.4902 3.04688 22.4805 2.91016 22.373 2.72461C21.3672 0.996094 19.1309 0 16.9824 0Z" />
          </svg>
        </div>
        <div class='title' data-textify>Open Source</div>
        <div class='text' data-textify>Browse the code or read the detailed docs to see how everything works.</div>
      </div>

    </div>

  </div>

  <div class='section'>

    <h2 data-textify>A Staple of DeFi Since 2020</h2>

    <h4 data-textify>CAP Labs pioneered on-demand oracles and continues to contribute to the DeFi community.</h4>

    <div class='partners'>
      <a href='https://portfolio.nansen.ai/?utm_campaign=portfolio_cap_27oct22' target='_blank'><img src='im/partners/nansen.png'></a>
      <a href='https://tokenterminal.com/terminal/projects/cap' target='_blank'><img src='im/partners/tokenterminal.svg'></a>
      <a href='https://dune.com/crypt0gnome/cap-finance' target='_blank'><img src='im/partners/dune.png'></a>
    </div>

    <div class='partners'>
      <a href='https://defillama.com/protocol/cap' target='_blank'><img src='im/partners/defillama.webp'></a>
      <a href='https://www.coingecko.com/en/coins/cap' target='_blank'><img src='im/partners/coingecko.webp'></a>
      <a href='https://thegraph.com/hosted-service/subgraph/0xcap/cap3' target='_blank'><img src='im/partners/graph.png'></a>
    </div>

  </div>

  <div class='section'>

    <h3 data-textify>Get started in seconds.</h3>

    <div class='button-wrapper'>
      <a class='button ' href='/trade'>Start Trading →</a>
    </div>

    <div class='note' data-textify>CAP is currently in public beta.</div>

  </div>

  <footer>

    <div class='footer-inner'>

      <div class='column'>
        <div class='logo'><img src='im/logo-full.svg'></div>
        <div class='copyright'>&copy; 2020 - <span id='yearValue'>{year}</span></div>
      </div>

      <div class='column'>
        <div class='category'>Product</div>
        <div class='item'><a href='/trade' class=''>Trade</a></div>
        <div class='item'><a href='/pool' class=''>Pool</a></div>
        <div class='item'><a href='/stake' class=''>Stake</a></div>
        <div class='item'><a href='/leaderboard' class=''>Leaderboard</a></div>
        <div class='item'><a href='https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x031d35296154279dc1984dcd93e392b1f946737b' target='_blank'>Buy CAP (Arbitrum)</a></div>
      </div>
        
      <div class='column'>
        <div class='category'>Resources</div>
        <div class='item'><a href='https://docs.cap.io/trade'>For Traders</a></div>
        <div class='item'><a href='https://docs.cap.io/pool'>For Liquidity Providers</a></div>
        <div class='item'><a href='https://docs.cap.io/stake'>For Stakers</a></div>
        <div class='item'><a href='https://docs.cap.io/developers'>For Developers</a></div>
        <div class='item'><a href='https://docs.cap.io/'>Docs</a></div>
      </div>

      <div class='column'>
        <div class='category'>Community</div>
        <div class='item'><a href='https://discord.gg/zkdr8vnujz' target='_blank'>Discord</a></div>
        <div class='item'><a href='https://twitter.com/CapDotFinance' target='_blank'>Twitter</a></div>
        <div class='item'><a href='https://capfinance.medium.com/' target='_blank'>Medium</a></div>
        <div class='item'><a href='https://github.com/0xcap' target='_blank'>Github</a></div>
        <div class='item'><a href='https://cap.finance/whitepaper_mm.pdf' target='_blank'>Whitepaper</a></div>
      </div>

      <div class='column'>
        <div class='category'>Legal</div>
        <div class='item'><a href='https://docs.cap.io/legal/terms-of-use'>Terms of Use</a></div>
        <div class='item'><a href='https://docs.cap.io/legal/restricted-jurisdiction-policy'>Restricted Jurisdictions</a></div>
        <div class='item'><a href='https://docs.cap.io/legal/risk-disclosure'>Risk Disclosure</a></div>
      </div>

    </div>

  </footer>

</div>
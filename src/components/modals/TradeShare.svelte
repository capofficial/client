<script defer>
    import { onMount } from 'svelte';
	import Modal from './Modal.svelte'
    import domtoimage from 'dom-to-image';
	import { LOADING_ICON } from '@lib/icons'
    import {getUPL} from '@lib/utils'
	import { prices, referralCode } from '@lib/stores'
	import { formatPnl, formatForDisplay } from '@lib/formatters'
	import { getReferralCode } from '@api/referrals'
	import { DOWNLOAD_ICON } from '@lib/icons'
    
    export let data;
    let imageData;
    onMount(async () => {
        await getReferralCode();
		let script = document.createElement('script');
        script.src = "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"
        document.head.append(script);

        script.onload = function() {
            new QRCode(document.getElementById("qrcode"), {
                text: `https://cap.io/${$referralCode ? `?r=${$referralCode}` : ''}`,
                width: 150,
                height: 150
            });		
            domtoimage.toPng(document.getElementById('canvas-content')).then(dataUrl => {
                imageData = dataUrl;
                var img = new Image();
                img.src = dataUrl;
                img.style.height = '85vh'
                document.getElementById('canvas').appendChild(img);
                document.getElementById('canvas-content').remove()
                document.getElementById('trade-loader-container').remove()
                document.getElementById('download-icon').style.display = 'flex'
            })
        };
	})

    const downloadIcon = () => {
        fetch(imageData)
            .then(response => response.blob())
            .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = data.market + ' ' + data.price + '.png';
            link.click();
        })
        .catch(console.error);
    }
    let pnl = getUPL(data, $prices[data.market]) / (data.margin * 0.01)
</script>
<Modal title='Share Position' width={screen.height / 2 + 50}>
    <body>
        <div id="canvas">
            <div class="container" id="canvas-content">
                <div class="cap-logo">
                    <svg class="cap-logo-svg" width="100%" height="100%" viewBox="0 0 1200 480" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <g transform="matrix(1,0,0,1,-960,-1740)">
                            <g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="1860" y="1980" width="300" height="120" style="fill:rgb(27,255,73);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="1560" y="1980" width="300" height="120" style="fill:rgb(18,221,59);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="1260" y="1980" width="300" height="120" style="fill:rgb(9,187,45);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="960" y="1980" width="300" height="120" style="fill:rgb(0,153,31);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="1560" y="1860" width="300" height="120" style="fill:rgb(27,255,73);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="1260" y="1860" width="300" height="120" style="fill:rgb(18,221,59);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-2.27374e-13,120)">
                                    <rect x="960" y="1860" width="300" height="120" style="fill:rgb(9,187,45);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-60,120)">
                                    <rect x="1140" y="1740" width="300" height="120" style="fill:rgb(18,221,59);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-60,120)">
                                    <rect x="1440" y="1740" width="300" height="120" style="fill:rgb(27,255,73);"/>
                                </g>
                                <g transform="matrix(1,0,0,1,-60,120)">
                                    <rect x="1260" y="1620" width="300" height="120" style="fill:rgb(27,255,73);"/>
                                </g>
                            </g>
                        </g>
                    </svg>
                    <span class="cap-logo-text">CAP Protocol</span>
                </div>
                <div class="position-container">
                    <p class="white-large">{data.market} <span class={data.isLong ? "primary" : "secondary"}>{data.isLong ? 'Long' : 'Short'}</span></p>
                    <p class={pnl > 0 ? 'position-profit' : 'position-profit loss'}>{formatPnl(pnl, true)}</p>
                    <div class="position-price-container">
                        <div>
                            <div class="price-heading">Entry Price</div>
                            <div class="price">{formatForDisplay(data.price)}</div>
                        </div>
                        <div style="margin-left: 1.5em">
                            <div class="price-heading">Mark Price</div>
                            <div class="price">{formatForDisplay($prices[data.market])}</div>
                        </div>
                    </div>
                </div>
                <div class="ref-container">
                    <div class="qrcode-container">
                        <div id="qrcode">

                        </div>
                    </div>
                    <div class="ref-p-container">
                        {#if $referralCode}
                            <p class="ref-p">
                                Referral code <span class="ref-code">{$referralCode}</span>
                            </p>
                        {/if}
                        <p class="ref-p">
                            Join CAP Protocol & make greater fortune!
                        </p>
                    </div>
                </div>
            </div>
            <div class='loader-container' id='trade-loader-container'>
                <div class='loading-icon'>{@html LOADING_ICON}</div>
            </div>
        </div>
    </body>
    <div class='download-icon' id='download-icon' on:click={downloadIcon}>
        {@html DOWNLOAD_ICON}
    </div>
</Modal>

<style>
    body {
        font-family: 'Inter var', sans-serif;
        display: flex;
        justify-content: center;
    }
    #canvas {
        width: 948px;
        position: relative;
        /* background-image: url("a.jpg"); */
        background-repeat: no-repeat;
        display: flex;
        z-index: -1;
        justify-content: center;
    }
    .container {
        width: 948px;
        height: 1422px;
        padding: 60px 50px;
        display: flex;
        flex: 0 0 100%;
        flex-direction: column;
        justify-content: space-between;
        background-color: black;
        margin-right: -150px;
    }
    .cap-logo {
        display: flex;
        flex-direction: row;
        height: 50px;
    }
    .cap-logo-text {
        margin-left: 20px;
        color: var(--primary);
        font-size: 48px;
    }
    .cap-logo-svg {
        width: 125px;
    }

    .position-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .white-large {
        font-size: 72px;
        color: white;
        margin: 0 0 20px;
    }
    .primary {
        color: var(--primary);
    }
    .secondary {
        color: var(--secondary);
    }
	

    .position-profit {
        font-size: 152px;
        color: var(--primary);
        margin: 20px 0 0;
    }
    .loss {
        color: var(--secondary);
    }
    .position-price-container {
        display: flex;
        flex-direction: row;
        margin-top: 75px;
    }
    .price-heading {
        font-size: 48px;
        color: #9499A1;
    }
    .price {
        font-size: 62px;
        color: white;
    }
    .ref-container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }
    .qrcode-container {
        background-color: white;
        padding: 7px;
    }
    .ref-p-container {
        margin-left: 50px;
        display: flex;
        flex-direction: column;
        align-self: center;
    }
    .ref-p {
        color: #9499A1;
        font-size: 42px;
        margin: 0;
    }
    .ref-code {
        color: #fff;
    }
    .loader-container {
        height: 85vh;
        width: 100%;
        display: flex;
        justify-content: center;
        z-index: 100;
        position: absolute;
        background: black;
    }
    .loading-icon {
        width: 50px;
        height: 50px;
        align-self: center;
    }
    .download-icon {
        display: none;
        position: absolute;
        bottom: 10px;
        right: 20px;
        background: white;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
</style>
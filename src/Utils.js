/*
 * Timescale 2.3.0
 * (c) 2019-2020 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/timescale
 * https://sjaakpriester.nl
 */

export function createDate(date)   {
    return date instanceof Date ? date : new Date(date);
}

export function createDiv(...classNames)
{
    return createElement('div', ...classNames)
}

export function createElement(tag, ...classNames)
{
    let r = document.createElement(tag);
    r.classList.add(...classNames);
    return r;
}

export function showElement(...elements)
{
    elements.forEach(e => {e.classList.remove('d-hidden');});
}

export function hideElement(...elements)
{
    elements.forEach(e => {e.classList.add('d-hidden');});
}

export function setPixels(element, prop, pxl)
{
    element.style[prop] = pxl == null ? null : pxl + 'px';
}

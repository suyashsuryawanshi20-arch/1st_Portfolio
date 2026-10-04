const menuToggle = document.querySelector('.ref-menu-toggle');
const siteNav = document.querySelector('.ref-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine) and (hover: hover)');
const introLoader = document.querySelector('.intro-loader');
const hero = document.querySelector('.ref-hero');
const siteHeader = document.querySelector('.ref-header');
const navLinks = [...siteNav.querySelectorAll('a[href^="#"]')];
const certificateDialog = document.querySelector('.ref-certificate-dialog');
const certificateFrame = document.querySelector('.ref-certificate-full');
const certificateTitle = document.querySelector('#certificate-dialog-title');
const contactDialog = document.querySelector('.ref-contact-dialog');
const contactForm = document.querySelector('.ref-contact-form');
const contactStatus = document.querySelector('.ref-contact-status');
const contactDraftLink = document.querySelector('.ref-contact-draft-link');
let certificateOpener = null;
let certificateCloseTimer = 0;
let contactOpener = null;
let contactCloseTimer = 0;

document.documentElement.classList.add('js-motion');

let showIntro = false;
try {
	showIntro = !reducedMotion.matches && sessionStorage.getItem('suyash-intro-seen') !== 'yes';
	if (showIntro) sessionStorage.setItem('suyash-intro-seen', 'yes');
} catch {
	showIntro = !reducedMotion.matches;
}

if (showIntro) {
	requestAnimationFrame(() => introLoader.classList.add('is-active'));
	window.setTimeout(() => introLoader.classList.add('is-leaving'), 950);
	window.setTimeout(() => introLoader.remove(), 1450);
} else {
	introLoader.remove();
}

menuToggle.addEventListener('click', () => {
	const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
	menuToggle.setAttribute('aria-expanded', String(!isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
	siteNav.classList.toggle('is-open', !isOpen);
});

siteNav.addEventListener('click', (event) => {
	if (event.target.closest('a')) {
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Open navigation');
		siteNav.classList.remove('is-open');
	}
});

window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
	if (event.matches) {
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Open navigation');
		siteNav.classList.remove('is-open');
	}
});

const revealElements = [...document.querySelectorAll('.reveal')];
const syncRevealVisibility = () => {
	const viewportHeight = document.documentElement.clientHeight;
	revealElements.forEach((element) => {
		const bounds = element.getBoundingClientRect();
		const isInView = bounds.bottom > viewportHeight * 0.08 && bounds.top < viewportHeight * 0.92;
		element.classList.toggle('is-visible', isInView);
	});
};

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
	revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
	const revealObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting));
	}, { threshold: 0.14 });
	revealElements.forEach((element) => revealObserver.observe(element));
	document.documentElement.classList.add('has-reveal-observer');
	window.addEventListener('scroll', syncRevealVisibility, { passive: true });
	window.addEventListener('resize', syncRevealVisibility);
	document.addEventListener('visibilitychange', syncRevealVisibility);
	syncRevealVisibility();
}

if ('IntersectionObserver' in window) {
	const sectionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			const activeId = entry.target.id;
			navLinks.forEach((link) => {
				link.classList.toggle('is-active', link.hash === `#${activeId}`);
			});
			hero.classList.toggle('is-past', activeId !== 'home');
			siteHeader.classList.toggle('is-scrolled', activeId !== 'home');
		});
	}, { rootMargin: '-32% 0px -56% 0px', threshold: 0 });

	document.querySelectorAll('[data-motion-section]').forEach((section) => sectionObserver.observe(section));
}

const closeCertificate = () => {
	if (!certificateDialog.open || certificateCloseTimer) return;
	certificateOpener?.classList.add('is-returning');
	certificateDialog.classList.add('is-closing');
	if (reducedMotion.matches || document.visibilityState !== 'visible') {
		certificateDialog.close();
		return;
	}
	certificateCloseTimer = window.setTimeout(() => {
		certificateDialog.close();
		certificateCloseTimer = 0;
	}, reducedMotion.matches ? 0 : 480);
};

document.querySelectorAll('.ref-envelope-open').forEach((button) => {
	button.addEventListener('click', () => {
		if (certificateDialog.open) return;
		certificateOpener = button;
		certificateTitle.textContent = button.dataset.certificateTitle;
		certificateFrame.src = button.dataset.certificateSrc;
		certificateDialog.classList.remove('is-closing');
		button.classList.add('is-opening');
		certificateDialog.showModal();
	});
});

document.querySelector('.ref-certificate-close').addEventListener('click', closeCertificate);
certificateDialog.addEventListener('cancel', (event) => {
	event.preventDefault();
	closeCertificate();
});
document.addEventListener('keydown', (event) => {
	if (event.key !== 'Escape') return;
	if (certificateDialog.open) {
		event.preventDefault();
		closeCertificate();
	} else if (contactDialog.open) {
		event.preventDefault();
		closeContact();
	}
});
certificateDialog.addEventListener('click', (event) => {
	if (event.target === certificateDialog) closeCertificate();
});
certificateDialog.addEventListener('close', () => {
	certificateFrame.removeAttribute('src');
	certificateDialog.classList.remove('is-closing');
	certificateOpener?.focus();
	certificateOpener?.classList.remove('is-opening', 'is-returning');
	certificateOpener = null;
});

const openContact = (opener) => {
	if (contactDialog.open) return;
	contactOpener = opener;
	contactDialog.classList.remove('is-closing');
	contactDialog.showModal();
};

const closeContact = () => {
	if (!contactDialog.open || contactCloseTimer) return;
	contactDialog.classList.add('is-closing');
	if (reducedMotion.matches || document.visibilityState !== 'visible') {
		contactDialog.close();
		return;
	}
	contactCloseTimer = window.setTimeout(() => {
		contactDialog.close();
		contactCloseTimer = 0;
	}, 260);
};

document.querySelectorAll('.ref-contact-open, [data-open-contact]').forEach((opener) => {
	opener.addEventListener('click', (event) => {
		event.preventDefault();
		openContact(opener);
	});
});

document.querySelector('.ref-contact-close').addEventListener('click', closeContact);
contactDialog.addEventListener('cancel', (event) => {
	event.preventDefault();
	closeContact();
});
contactDialog.addEventListener('click', (event) => {
	if (event.target === contactDialog) closeContact();
});
contactDialog.addEventListener('close', () => {
	contactDialog.classList.remove('is-closing');
	contactOpener?.focus();
	contactOpener = null;
});

contactForm.addEventListener('submit', (event) => {
	event.preventDefault();
	if (!contactForm.reportValidity()) return;

	const values = new FormData(contactForm);
	const name = String(values.get('name')).trim();
	const email = String(values.get('email')).trim();
	const purpose = String(values.get('purpose')).trim();
	const message = String(values.get('message')).trim();
	const subject = `Portfolio message: ${purpose}`;
	const body = `Name: ${name}\nEmail: ${email}\nPurpose: ${purpose}\n\n${message}`;
	contactDraftLink.href = `mailto:suyashsuryawanshi20@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	contactForm.hidden = true;
	contactStatus.hidden = false;
	contactStatus.focus();
	contactDraftLink.click();
});

document.querySelector('.ref-contact-edit').addEventListener('click', () => {
	contactStatus.hidden = true;
	contactForm.hidden = false;
	contactForm.querySelector('[name="name"]').focus();
});

if (finePointer.matches && !reducedMotion.matches) {
	const setTilt = (element, event, maxX, maxY) => {
		const rect = element.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width - 0.5;
		const y = (event.clientY - rect.top) / rect.height - 0.5;
		element.style.setProperty('--tilt-x', `${-y * maxX}deg`);
		element.style.setProperty('--tilt-y', `${x * maxY}deg`);
		return { x, y };
	};

	const bindTilt = (element, maxX, maxY, includeArt = false) => {
		let frame = 0;
		let latestEvent;
		element.addEventListener('pointermove', (event) => {
			if (event.pointerType === 'touch') return;
			latestEvent = event;
			if (frame) return;

			frame = requestAnimationFrame(() => {
				const { x, y } = setTilt(element, latestEvent, maxX, maxY);
				if (includeArt) {
					element.style.setProperty('--art-x', `${-x * 7}px`);
					element.style.setProperty('--art-y', `${-y * 7}px`);
				}
				frame = 0;
			});
		});
		element.addEventListener('pointerleave', () => {
			if (frame) cancelAnimationFrame(frame);
			frame = 0;
			element.style.setProperty('--tilt-x', '0deg');
			element.style.setProperty('--tilt-y', '0deg');
			element.style.setProperty('--art-x', '0px');
			element.style.setProperty('--art-y', '0px');
		});
	};

	const portraitStage = document.querySelector('.ref-portrait-stage');
	let portraitFrame = 0;
	let portraitPointer;
	portraitStage.addEventListener('pointermove', (event) => {
		if (event.pointerType === 'touch') return;
		const rect = portraitStage.getBoundingClientRect();
		portraitPointer = {
			x: (event.clientX - rect.left) / rect.width - 0.5,
			y: (event.clientY - rect.top) / rect.height - 0.5
		};
		if (portraitFrame) return;

		portraitFrame = requestAnimationFrame(() => {
			const { x, y } = portraitPointer;
			portraitStage.style.setProperty('--portrait-x', `${x * 24}px`);
			portraitStage.style.setProperty('--portrait-y', `${y * 20}px`);
			portraitStage.style.setProperty('--portrait-rx', `${-y * 8}deg`);
			portraitStage.style.setProperty('--portrait-ry', `${x * 12}deg`);
			portraitStage.style.setProperty('--disc-x', `${x * 20}px`);
			portraitStage.style.setProperty('--disc-y', `${y * 16}px`);
			portraitFrame = 0;
		});
	});
	portraitStage.addEventListener('pointerleave', () => {
		if (portraitFrame) cancelAnimationFrame(portraitFrame);
		portraitFrame = 0;
		['--portrait-x', '--portrait-y', '--disc-x', '--disc-y'].forEach((property) => portraitStage.style.setProperty(property, '0px'));
		['--portrait-rx', '--portrait-ry'].forEach((property) => portraitStage.style.setProperty(property, '0deg'));
	});

	document.querySelectorAll('.ref-skill').forEach((skill) => bindTilt(skill, 3, 5));
	document.querySelectorAll('.ref-project-card').forEach((card) => bindTilt(card, 4, 6, true));

	document.querySelectorAll('.ref-nav-cta, .ref-footer-main .ref-button-gold').forEach((button) => {
		let frame = 0;
		button.addEventListener('pointermove', (event) => {
			const rect = button.getBoundingClientRect();
			const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
			const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
			if (frame) cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				button.style.setProperty('--mag-x', `${x}px`);
				button.style.setProperty('--mag-y', `${y}px`);
				frame = 0;
			});
		});
		button.addEventListener('pointerleave', () => {
			if (frame) cancelAnimationFrame(frame);
			button.style.setProperty('--mag-x', '0px');
			button.style.setProperty('--mag-y', '0px');
		});
	});

	const cursor = document.querySelector('.custom-cursor');
	const cursorTargets = document.querySelectorAll('a, button, .ref-project-card');
	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	let cursorFrame = 0;
	const animateCursor = () => {
		currentX += (targetX - currentX) * 0.24;
		currentY += (targetY - currentY) * 0.24;
		cursor.style.left = `${currentX}px`;
		cursor.style.top = `${currentY}px`;
		if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.4) {
			cursorFrame = requestAnimationFrame(animateCursor);
		} else {
			cursorFrame = 0;
		}
	};
	document.documentElement.classList.add('has-custom-cursor');
	document.addEventListener('pointermove', (event) => {
		if (event.pointerType === 'touch') return;
		targetX = event.clientX;
		targetY = event.clientY;
		cursor.classList.add('is-visible');
		if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor);
	});
	window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
	cursorTargets.forEach((target) => {
		target.addEventListener('pointerenter', () => {
			cursor.classList.toggle('is-view', target.matches('.ref-project-card'));
			cursor.classList.toggle('is-contact', target.matches('.ref-nav-cta, .ref-footer-main .ref-button-gold'));
		});
		target.addEventListener('pointerleave', () => cursor.classList.remove('is-view', 'is-contact'));
	});
}

document.querySelector('#year').textContent = new Date().getFullYear();

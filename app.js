// Firebase-enabled app.js
console.log('Loading app.js...');

import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('Firebase modules imported successfully');

// Global current user reference
let currentUser = null;

// User data management with Firebase
class UserData {
    constructor() {
        this.hearts = 3;
        this.streak = 0;
        this.lastLogin = null;
        this.lastCompletionDate = null;
        this.completedToday = false;
        this.briefingsCompleted = [];
        this.maxStreak = 0;
        this.totalDaysPlayed = 0;
        this.distribution = { 1: 0, 3: 0, 5: 0 };
        this.difficultyLevel = null;
        this.displayName = '';
        this.unsubscribe = null;
    }

    // Load data from Firestore with real-time updates
    async loadFromFirebase(userId) {
        try {
            const userDocRef = doc(db, 'users', userId);

            // Set up real-time listener
            this.unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    this.hearts = data.hearts || 3;
                    this.streak = data.streak || 0;
                    this.lastLogin = data.lastLogin || null;
                    this.lastCompletionDate = data.lastCompletionDate || null;
                    this.completedToday = data.completedToday || false;
                    this.briefingsCompleted = data.briefingsCompleted || [];
                    this.maxStreak = data.maxStreak || 0;
                    this.totalDaysPlayed = data.totalDaysPlayed || 0;
                    this.distribution = data.distribution || { 1: 0, 3: 0, 5: 0 };
                    this.difficultyLevel = data.difficultyLevel || null;
                    this.displayName = data.displayName || '';

                    // Trivial localStorage backup
                    this.backupToLocalStorage();

                    // Update UI
                    updateUserStats();
                } else {
                    // Create new user document with defaults
                    this.createUserDocument(userId);
                }
            });

            await this.checkDailyLogin(userId);
        } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to localStorage
            this.loadFromLocalStorage();
        }
    }

    // Create initial user document in Firestore
    async createUserDocument(userId) {
        try {
            const userDocRef = doc(db, 'users', userId);
            await setDoc(userDocRef, {
                hearts: 3,
                streak: 0,
                lastLogin: new Date().toDateString(),
                lastCompletionDate: null,
                completedToday: false,
                briefingsCompleted: [],
                maxStreak: 0,
                totalDaysPlayed: 0,
                distribution: { 1: 0, 3: 0, 5: 0 },
                difficultyLevel: null,
                displayName: currentUser?.displayName || '',
                email: currentUser?.email || '',
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }

    // Save to Firestore
    async saveToFirebase(userId) {
        if (!userId) return;

        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                hearts: this.hearts,
                streak: this.streak,
                lastLogin: this.lastLogin,
                lastCompletionDate: this.lastCompletionDate,
                completedToday: this.completedToday,
                briefingsCompleted: this.briefingsCompleted,
                maxStreak: this.maxStreak,
                totalDaysPlayed: this.totalDaysPlayed,
                distribution: this.distribution,
                difficultyLevel: this.difficultyLevel,
                displayName: this.displayName
            });

            // Trivial localStorage backup
            this.backupToLocalStorage();
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    }

    // Fallback: Load from localStorage (for offline/guests)
    loadFromLocalStorage() {
        const data = localStorage.getItem('pastport_user');
        if (data) {
            const parsed = JSON.parse(data);
            this.hearts = parsed.hearts || 3;
            this.streak = parsed.streak || 0;
            this.lastLogin = parsed.lastLogin || null;
            this.lastCompletionDate = parsed.lastCompletionDate || null;
            this.completedToday = parsed.completedToday || false;
            this.briefingsCompleted = parsed.briefingsCompleted || [];
            this.maxStreak = parsed.maxStreak || 0;
            this.totalDaysPlayed = parsed.totalDaysPlayed || 0;
            this.distribution = parsed.distribution || { 1: 0, 3: 0, 5: 0 };
            this.difficultyLevel = parsed.difficultyLevel || null;
        }
        this.checkDailyLogin(null);
        updateUserStats();
    }

    // Trivial localStorage backup (not primary storage)
    backupToLocalStorage() {
        const data = {
            hearts: this.hearts,
            streak: this.streak,
            lastLogin: this.lastLogin,
            lastCompletionDate: this.lastCompletionDate,
            completedToday: this.completedToday,
            briefingsCompleted: this.briefingsCompleted,
            maxStreak: this.maxStreak,
            totalDaysPlayed: this.totalDaysPlayed,
            distribution: this.distribution,
            difficultyLevel: this.difficultyLevel
        };
        localStorage.setItem('pastport_user', JSON.stringify(data));
    }

    setDifficultyLevel(level) {
        this.difficultyLevel = level;
        if (currentUser) {
            this.saveToFirebase(currentUser.uid);
        } else {
            this.backupToLocalStorage();
        }
    }

    async checkDailyLogin(userId) {
        const today = new Date().toDateString();

        if (this.lastLogin !== today) {
            this.lastLogin = today;
            this.completedToday = false;
            this.hearts = Math.min(this.hearts + 1, 3);

            if (userId) {
                await this.saveToFirebase(userId);
            } else {
                this.backupToLocalStorage();
            }
        }
    }

    animateStreak() {
        const streakIcon = document.querySelector('.streak-icon');
        if (streakIcon) {
            streakIcon.classList.add('celebrating');
            this.createStreakParticles(streakIcon);
            setTimeout(() => {
                streakIcon.classList.remove('celebrating');
            }, 600);
        }
    }

    createStreakParticles(element) {
        const particles = ['✨', '🔥', '⭐', '💫'];
        const container = element.closest('.stat');

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'streak-particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];

            const angle = (Math.PI * 2 * i) / 6;
            const distance = 40;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);

            container.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

    useHeart() {
        if (this.hearts > 0) {
            this.hearts--;
            if (currentUser) {
                this.saveToFirebase(currentUser.uid);
            } else {
                this.backupToLocalStorage();
            }
            return true;
        }
        return false;
    }

    completeDay(briefingCount) {
        if (![1, 3, 5].includes(briefingCount)) {
            return;
        }

        const today = new Date().toDateString();

        if (this.completedToday) {
            return;
        }

        this.completedToday = true;
        let streakIncreased = false;

        if (this.lastCompletionDate) {
            const lastCompletionDate = new Date(this.lastCompletionDate);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastCompletionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.streak++;
                streakIncreased = true;
                if (this.streak > this.maxStreak) {
                    this.maxStreak = this.streak;
                }
            } else if (diffDays > 1) {
                this.streak = 1;
                this.maxStreak = Math.max(this.maxStreak, 1);
            }
        } else {
            this.streak = 1;
            this.maxStreak = 1;
            streakIncreased = true;
        }

        this.lastCompletionDate = today;
        this.totalDaysPlayed++;

        if (currentUser) {
            this.saveToFirebase(currentUser.uid);
        } else {
            this.backupToLocalStorage();
        }

        if (streakIncreased) {
            setTimeout(() => this.animateStreak(), 500);
        }
    }

    hasCompletedBriefing(briefingId) {
        return this.briefingsCompleted.includes(briefingId);
    }

    markBriefingComplete(briefingId) {
        if (!this.briefingsCompleted.includes(briefingId)) {
            this.briefingsCompleted.push(briefingId);
            if (currentUser) {
                this.saveToFirebase(currentUser.uid);
            } else {
                this.backupToLocalStorage();
            }
        }
    }

    stopListening() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize userData
const userData = new UserData();

// Make userData globally available
window.userData = userData;

console.log('UserData initialized:', userData);

// Initialize with localStorage first (synchronous)
userData.loadFromLocalStorage();

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    try {
        currentUser = user;
        console.log('Auth state changed. User:', user ? user.email : 'null');

        if (user) {
            // User is signed in - load from Firebase
            console.log('User signed in:', user.email);
            await userData.loadFromFirebase(user.uid);
        } else {
            // User is signed out - use localStorage
            console.log('No user signed in, using localStorage');
            userData.stopListening();
            userData.loadFromLocalStorage();
        }
    } catch (err) {
        console.error('Auth state change error:', err);
    }
});

function updateUserStats() {
    const streakElement = document.getElementById('streak');
    const heartsElement = document.getElementById('hearts');

    if (streakElement) {
        streakElement.textContent = userData.streak;
    }

    if (heartsElement) {
        heartsElement.textContent = userData.hearts;
    }
}

function getOnThisDayEvent() {
    const today = new Date();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const day = today.getDate();

    const events = {
        'January': {
            1: "The Emancipation Proclamation takes effect, declaring freedom for enslaved people in Confederate states (1863)",
            5: "George Washington Carver Day recognizes the agricultural scientist's contributions (1943)",
            8: "Elvis Presley is born in Tupelo, Mississippi (1935)",
            9: "Apple unveils the first iPhone at Macworld in San Francisco (2007)",
            15: "Martin Luther King Jr. is born in Atlanta, Georgia (1929)",
            17: "Benjamin Franklin is born in Boston (1706)",
            20: "John F. Kennedy is inaugurated as the 35th President (1961)",
            27: "The Vietnam War ends as a peace accord is signed in Paris (1973)"
        },
        'February': {
            2: "The Groundhog Day tradition begins in Punxsutawney, Pennsylvania (1887)",
            4: "Facebook is founded by Mark Zuckerberg at Harvard University (2004)",
            12: "Abraham Lincoln is born in Hodgenville, Kentucky (1809)",
            14: "Arizona becomes the 48th U.S. state (1912)",
            22: "George Washington is born in Westmoreland County, Virginia (1732)"
        },
        'March': {
            3: "Alexander Graham Bell is born in Edinburgh, Scotland (1847)",
            15: "The Ides of March - Julius Caesar is assassinated (44 BCE)",
            17: "St. Patrick's Day celebrates Irish culture and heritage",
            25: "The Triangle Shirtwaist Factory fire kills 146 workers in New York City (1911)",
            31: "The Eiffel Tower is officially opened in Paris (1889)"
        },
        'April': {
            6: "The United States enters World War I (1917)",
            12: "The American Civil War begins with the Battle of Fort Sumter (1861)",
            14: "President Abraham Lincoln is shot at Ford's Theatre (1865)",
            15: "Abraham Lincoln dies after being shot by John Wilkes Booth (1865)",
            18: "The San Francisco earthquake devastates the city (1906)"
        },
        'May': {
            1: "The Empire State Building opens in New York City (1931)",
            4: "The Haymarket affair labor protest occurs in Chicago (1886)",
            14: "Lewis and Clark begin their expedition to explore the American West (1804)",
            21: "Charles Lindbergh completes first solo transatlantic flight (1927)",
            29: "John F. Kennedy is born in Brookline, Massachusetts (1917)"
        },
        'June': {
            6: "D-Day: Allied forces land in Normandy, France during World War II (1944)",
            14: "The Stars and Stripes is adopted as the flag of the United States (1777)",
            19: "Juneteenth - Union soldiers announce freedom to enslaved people in Texas (1865)",
            25: "General Custer's Last Stand at the Battle of Little Bighorn (1876)",
            28: "The Stonewall Riots begin in New York City (1969)"
        },
        'July': {
            2: "President James Garfield is shot by an assassin (1881)",
            4: "The Declaration of Independence is adopted by the Continental Congress (1776)",
            16: "The first atomic bomb test is conducted in New Mexico (1945)",
            20: "Apollo 11 astronauts Neil Armstrong and Buzz Aldrin land on the moon (1969)",
            26: "The Americans with Disabilities Act is signed into law (1990)"
        },
        'August': {
            6: "The Voting Rights Act is signed into law (1965)",
            14: "Japan announces surrender, ending World War II (1945)",
            18: "The 19th Amendment is ratified, granting women the right to vote (1920)",
            26: "The 19th Amendment is certified, officially giving women the right to vote (1920)",
            28: "Martin Luther King Jr. delivers his 'I Have a Dream' speech (1963)"
        },
        'September': {
            5: "The first Labor Day parade is held in New York City (1882)",
            11: "Terrorist attacks on the World Trade Center and Pentagon (2001)",
            17: "The U.S. Constitution is signed in Philadelphia (1787)",
            25: "The Bill of Rights is submitted to the states for ratification (1789)"
        },
        'October': {
            1: "Yosemite National Park is established (1890)",
            12: "Christopher Columbus reaches the Americas (1492)",
            24: "The United Nations is officially established (1945)",
            28: "The Statue of Liberty is dedicated in New York Harbor (1886)",
            29: "The stock market crashes, beginning the Great Depression (1929)"
        },
        'November': {
            5: "Susan B. Anthony casts first vote by a woman in a U.S. election (1872)",
            9: "The Berlin Wall falls, symbolizing the end of the Cold War (1989)",
            11: "World War I ends with the signing of the Armistice (1918)",
            19: "President Lincoln delivers the Gettysburg Address (1863)",
            22: "President John F. Kennedy is assassinated in Dallas, Texas (1963)"
        },
        'December': {
            1: "Rosa Parks refuses to give up her bus seat in Montgomery, Alabama (1955)",
            7: "Japanese forces attack Pearl Harbor, bringing the U.S. into World War II (1941)",
            15: "The Bill of Rights is ratified (1791)",
            17: "The Wright brothers make the first powered flight at Kitty Hawk (1903)",
            25: "George Washington crosses the Delaware River (1776)"
        }
    };

    const monthEvents = events[month] || {};
    const event = monthEvents[day] || "A significant historical event occurred on this day.";

    return {
        month,
        day,
        event
    };
}

function initHomePage() {
    updateUserStats();

    const briefingOptions = document.querySelectorAll('.briefing-option');
    const startButton = document.getElementById('startButton');
    let selectedCount = 0;

    briefingOptions.forEach(option => {
        option.addEventListener('click', () => {
            briefingOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedCount = parseInt(option.dataset.count);
            startButton.disabled = false;
        });
    });

    startButton.addEventListener('click', () => {
        try {
            console.log('Start button clicked. Selected count:', selectedCount);
            if (selectedCount > 0) {
                const hasSeenAccountPrompt = localStorage.getItem('pastport_account_prompt_seen');
                console.log('Has seen account prompt:', hasSeenAccountPrompt);
                console.log('User difficulty level:', userData.difficultyLevel);

                if (!hasSeenAccountPrompt) {
                    showAccountPrompt(selectedCount);
                } else if (!userData.difficultyLevel) {
                    showDifficultyModal(selectedCount);
                } else {
                    startBriefing(selectedCount);
                }
            }
        } catch (error) {
            console.error('Error in start button click:', error);
            alert('An error occurred. Please refresh the page and try again.');
        }
    });

    function showAccountPrompt(briefingCount) {
        const accountPromptModal = document.getElementById('accountPromptModal');
        const signUpModal = document.getElementById('signUpModal');

        accountPromptModal.classList.remove('hidden');

        document.getElementById('createAccountBtn').addEventListener('click', () => {
            accountPromptModal.classList.add('hidden');
            signUpModal.classList.remove('hidden');
        }, { once: true });

        document.getElementById('continueWithoutAccountBtn').addEventListener('click', () => {
            localStorage.setItem('pastport_account_prompt_seen', 'true');
            accountPromptModal.classList.add('hidden');
            if (!userData.difficultyLevel) {
                showDifficultyModal(briefingCount);
            } else {
                startBriefing(briefingCount);
            }
        }, { once: true });

        // Handle sign-up form
        const signUpForm = document.getElementById('signUpForm');
        const closeSignUp = document.getElementById('closeSignUp');

        if (closeSignUp) {
            closeSignUp.addEventListener('click', () => {
                signUpModal.classList.add('hidden');
                accountPromptModal.classList.remove('hidden');
            }, { once: true });
        }

        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupPasswordConfirm').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                // Create user with Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update display name
                await updateProfile(user, {
                    displayName: name
                });

                // Create user document in Firestore
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    displayName: name,
                    email: email,
                    hearts: 3,
                    streak: 0,
                    lastLogin: new Date().toDateString(),
                    lastCompletionDate: null,
                    completedToday: false,
                    briefingsCompleted: [],
                    maxStreak: 0,
                    totalDaysPlayed: 0,
                    distribution: { 1: 0, 3: 0, 5: 0 },
                    difficultyLevel: null,
                    createdAt: new Date().toISOString()
                });

                localStorage.setItem('pastport_account_prompt_seen', 'true');
                signUpModal.classList.add('hidden');

                if (!userData.difficultyLevel) {
                    showDifficultyModal(briefingCount);
                } else {
                    startBriefing(briefingCount);
                }
            } catch (error) {
                console.error('Sign up error:', error);
                let message = 'Failed to create account.';

                if (error.code === 'auth/email-already-in-use') {
                    message = 'This email is already in use.';
                } else if (error.code === 'auth/weak-password') {
                    message = 'Password should be at least 6 characters.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Invalid email address.';
                }

                alert(message);
            }
        }, { once: true });

        // Handle switching to sign-in modal from sign-up
        const switchToSignIn = document.getElementById('switchToSignIn');
        if (switchToSignIn) {
            switchToSignIn.addEventListener('click', (e) => {
                e.preventDefault();
                signUpModal.classList.add('hidden');
                showSignInModal(briefingCount);
            }, { once: true });
        }
    }

    function showSignInModal(briefingCount) {
        const signInModal = document.getElementById('signInModal');
        const signInForm = document.getElementById('signInForm');
        const closeSignIn = document.getElementById('closeSignIn');

        signInModal.classList.remove('hidden');

        if (closeSignIn) {
            closeSignIn.addEventListener('click', () => {
                signInModal.classList.add('hidden');
            }, { once: true });
        }

        // Allow clicking outside modal to close
        signInModal.addEventListener('click', (e) => {
            if (e.target === signInModal) {
                signInModal.classList.add('hidden');
            }
        }, { once: true });

        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('signinEmail').value;
            const password = document.getElementById('signinPassword').value;

            try {
                // Sign in with Firebase Authentication
                await signInWithEmailAndPassword(auth, email, password);

                localStorage.setItem('pastport_account_prompt_seen', 'true');
                signInModal.classList.add('hidden');

                if (!userData.difficultyLevel) {
                    showDifficultyModal(briefingCount);
                } else {
                    startBriefing(briefingCount);
                }
            } catch (error) {
                console.error('Sign in error:', error);
                let message = 'Failed to sign in.';

                if (error.code === 'auth/user-not-found') {
                    message = 'No account found with this email.';
                } else if (error.code === 'auth/wrong-password') {
                    message = 'Incorrect password.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Invalid email address.';
                }

                alert(message);
            }
        }, { once: true });

        // Handle switching to sign-up modal from sign-in
        const switchToSignUp = document.getElementById('switchToSignUp');
        if (switchToSignUp) {
            switchToSignUp.addEventListener('click', (e) => {
                e.preventDefault();
                signInModal.classList.add('hidden');
                document.getElementById('signUpModal').classList.remove('hidden');
            }, { once: true });
        }

        // Handle forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Password reset functionality would be implemented with a backend service. For now, please contact support or create a new account.');
            }, { once: true });
        }
    }

    function showDifficultyModal(briefingCount) {
        const difficultyModal = document.getElementById('difficultyModal');
        difficultyModal.classList.remove('hidden');

        const difficultyCards = difficultyModal.querySelectorAll('.difficulty-card');
        difficultyCards.forEach(card => {
            card.addEventListener('click', () => {
                const level = card.dataset.level;
                userData.setDifficultyLevel(level);
                difficultyModal.classList.add('hidden');
                startBriefing(briefingCount);
            }, { once: true });
        });
    }

    function startBriefing(count) {
        console.log('Starting briefing with count:', count);
        userData.distribution[count]++;
        if (currentUser) {
            userData.saveToFirebase(currentUser.uid);
        } else {
            userData.backupToLocalStorage();
        }
        // Save briefing count to sessionStorage for briefing.js
        sessionStorage.setItem('briefingCount', count);
        window.location.href = `briefing.html?count=${count}`;
    }

    const statsButton = document.getElementById('statsButton');
    const statsModal = document.getElementById('statsModal');
    const closeStats = document.getElementById('closeStats');

    if (statsButton && statsModal) {
        statsButton.addEventListener('click', () => {
            statsModal.classList.remove('hidden');
            updateStatsModal();
        });

        if (closeStats) {
            closeStats.addEventListener('click', () => {
                statsModal.classList.add('hidden');
            });
        }

        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                statsModal.classList.add('hidden');
            }
        });
    }

    function updateStatsModal() {
        document.getElementById('totalPlayed').textContent = userData.totalDaysPlayed;
        document.getElementById('totalBriefings').textContent = userData.briefingsCompleted.length;
        document.getElementById('currentStreak').textContent = userData.streak;
        document.getElementById('maxStreak').textContent = userData.maxStreak;

        const total = userData.distribution[1] + userData.distribution[3] + userData.distribution[5];
        if (total > 0) {
            const pct1 = (userData.distribution[1] / total) * 100;
            const pct3 = (userData.distribution[3] / total) * 100;
            const pct5 = (userData.distribution[5] / total) * 100;

            document.getElementById('dist1').style.width = pct1 + '%';
            document.getElementById('dist3').style.width = pct3 + '%';
            document.getElementById('dist5').style.width = pct5 + '%';

            document.getElementById('dist1').querySelector('span').textContent = userData.distribution[1];
            document.getElementById('dist3').querySelector('span').textContent = userData.distribution[3];
            document.getElementById('dist5').querySelector('span').textContent = userData.distribution[5];
        }
    }

    // On This Day initialization
    const otdDateInline = document.getElementById('otdDateInline');
    const otdEventInline = document.getElementById('otdEventInline');

    if (otdDateInline && otdEventInline) {
        const onThisDay = getOnThisDayEvent();
        otdDateInline.textContent = `${onThisDay.month} ${onThisDay.day}`;
        otdEventInline.textContent = onThisDay.event;
    }

    function generateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        const leaderboardYou = document.getElementById('leaderboardYou');

        if (!leaderboardList) return;

        const mockUsers = [
            { name: 'HistoryBuff92', streak: 47, score: 2350 },
            { name: 'SarahM_Chicago', streak: 38, score: 2140 },
            { name: 'TimeTravel_Tom', streak: 32, score: 1920 },
            { name: 'PastMaster', streak: 28, score: 1680 },
            { name: 'AmericanHero', streak: 21, score: 1260 },
            { name: 'Jessica_TX', streak: 19, score: 1140 },
            { name: 'FactFinder', streak: 15, score: 950 },
            { name: 'MikeTheHistorian', streak: 12, score: 780 },
            { name: 'Alex_Boston', streak: 11, score: 720 },
            { name: 'PatriotLearner', streak: 10, score: 680 },
            { name: 'Emma_Seattle', streak: 9, score: 630 },
            { name: 'HistoryNerd23', streak: 8, score: 580 },
            { name: 'Daniel_NYC', streak: 7, score: 530 },
            { name: 'LibertyCat', streak: 7, score: 520 },
            { name: 'Maya_Denver', streak: 6, score: 480 },
            { name: 'ChronoExplorer', streak: 6, score: 470 },
            { name: 'Rachel_Austin', streak: 5, score: 420 },
            { name: 'VintageVibe', streak: 5, score: 410 },
            { name: 'Brandon_Miami', streak: 4, score: 370 },
            { name: 'ArchiveAnnie', streak: 4, score: 360 },
            { name: 'Kevin_Portland', streak: 4, score: 350 },
            { name: 'Luna_Phoenix', streak: 3, score: 310 },
            { name: 'TimeWatcher', streak: 3, score: 300 },
            { name: 'Sophie_Atlanta', streak: 3, score: 290 },
            { name: 'DocBrown88', streak: 2, score: 250 },
            { name: 'Ethan_Nashville', streak: 2, score: 240 },
            { name: 'HistoryHound', streak: 2, score: 230 },
            { name: 'Olivia_Dallas', streak: 2, score: 220 },
            { name: 'PastSeeker', streak: 1, score: 180 },
            { name: 'Jake_SanDiego', streak: 1, score: 170 },
            { name: 'MemoryLane', streak: 1, score: 160 },
            { name: 'Sophia_Vegas', streak: 1, score: 150 },
            { name: 'TimeCapsule', streak: 1, score: 140 },
            { name: 'Liam_Tampa', streak: 1, score: 130 },
            { name: 'AncientAce', streak: 1, score: 120 },
            { name: 'Isabella_KC', streak: 1, score: 110 },
            { name: 'ChronoChaser', streak: 1, score: 100 },
            { name: 'Noah_Raleigh', streak: 1, score: 90 },
            { name: 'FactChecker77', streak: 1, score: 80 },
            { name: 'Ava_Baltimore', streak: 0, score: 70 },
            { name: 'PastPioneer', streak: 0, score: 60 },
            { name: 'Mason_Detroit', streak: 0, score: 50 },
            { name: 'HistoryHawk', streak: 0, score: 40 },
            { name: 'Mia_Milwaukee', streak: 0, score: 30 },
            { name: 'TimelineTracer', streak: 0, score: 20 },
            { name: 'Lucas_Memphis', streak: 0, score: 10 },
            { name: 'ChronoCrafter', streak: 0, score: 5 },
            { name: 'Harper_Tucson', streak: 0, score: 5 },
            { name: 'AmericanEagle', streak: 0, score: 5 },
            { name: 'Ella_OKC', streak: 0, score: 5 },
            { name: 'HistoryHelper', streak: 0, score: 5 },
            { name: 'Logan_Louisville', streak: 0, score: 5 },
            { name: 'PastPath', streak: 0, score: 5 },
            { name: 'Chloe_Richmond', streak: 0, score: 5 },
            { name: 'TimeKeeper19', streak: 0, score: 5 },
            { name: 'Aiden_Boise', streak: 0, score: 5 },
            { name: 'Chronicle99', streak: 0, score: 5 },
            { name: 'Emily_Charleston', streak: 0, score: 5 },
            { name: 'HistoryHunter', streak: 0, score: 5 },
            { name: 'Jackson_Spokane', streak: 0, score: 5 },
            { name: 'EraExplorer', streak: 0, score: 5 },
            { name: 'Zoe_DesMoines', streak: 0, score: 5 },
            { name: 'PortsExplorer', streak: 0, score: 5 },
            { name: 'Carter_Fargo', streak: 0, score: 5 },
            { name: 'AnnalsAnna', streak: 0, score: 5 },
            { name: 'Aria_Sioux', streak: 0, score: 5 },
            { name: 'HistoryHero22', streak: 0, score: 5 },
            { name: 'Grayson_Cheyenne', streak: 0, score: 5 },
            { name: 'TimeTracker', streak: 0, score: 5 },
            { name: 'Lily_Juneau', streak: 0, score: 5 },
            { name: 'ChronoCollector', streak: 0, score: 5 },
            { name: 'Leo_Augusta', streak: 0, score: 5 },
            { name: 'FactFanatic', streak: 0, score: 5 },
            { name: 'Grace_Concord', streak: 0, score: 5 },
            { name: 'HistoryHype', streak: 0, score: 5 },
            { name: 'Sebastian_Dover', streak: 0, score: 5 },
            { name: 'TimeTrekker', streak: 0, score: 5 },
            { name: 'Layla_Montpelier', streak: 0, score: 5 },
            { name: 'PastExplorer88', streak: 0, score: 5 },
            { name: 'Owen_Trenton', streak: 0, score: 5 }
        ];

        // Show only top 5 users in leaderboard
        leaderboardList.innerHTML = mockUsers.slice(0, 5).map((user, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${user.name}</div>
                    <div class="leaderboard-stats">${user.streak}d streak</div>
                </div>
                <div class="leaderboard-score">${user.score}</div>
            </div>
        `).join('');

        const userScore = (userData.streak * 50) + (userData.totalDaysPlayed * 10);
        const allScores = [userScore, ...mockUsers.map(u => u.score)].sort((a, b) => b - a);
        const userRank = allScores.indexOf(userScore) + 1;

        leaderboardYou.querySelector('.leaderboard-rank').textContent = '#' + userRank;
        leaderboardYou.querySelector('.leaderboard-stats').textContent = `${userData.streak}d streak`;
        leaderboardYou.querySelector('.leaderboard-score').textContent = userScore;
    }

    const otdLearnMore = document.getElementById('otdLearnMore');

    if (otdLearnMore) {
        otdLearnMore.addEventListener('click', (e) => {
            e.preventDefault();
            const event = getOnThisDayEvent();

            let searchQuery = event.event;

            const quotedMatch = searchQuery.match(/'([^']+)'/);
            const theMatch = searchQuery.match(/\b(?:the|on the)\s+([A-Z][^,.]+)/);

            if (quotedMatch) {
                searchQuery = quotedMatch[1];
            } else if (theMatch) {
                searchQuery = theMatch[1];
            }

            const britannicaUrl = `https://www.britannica.com/search?query=${encodeURIComponent(searchQuery)}`;

            window.open(britannicaUrl, '_blank', 'noopener,noreferrer');
        });
    }

    const closeReminder = document.getElementById('closeReminder');
    const dailyReminder = document.getElementById('dailyReminder');

    if (closeReminder && dailyReminder) {
        closeReminder.addEventListener('click', () => {
            dailyReminder.style.display = 'none';
            localStorage.setItem('pastport_hide_reminder', 'true');
        });

        if (localStorage.getItem('pastport_hide_reminder') === 'true') {
            dailyReminder.style.display = 'none';
        }
    }

    const profileButton = document.getElementById('profileButton');
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfile');

    if (profileButton && profileModal) {
        profileButton.addEventListener('click', () => {
            // If not logged in, show sign in modal instead
            if (!currentUser) {
                document.getElementById('signInModal').classList.remove('hidden');
                return;
            }
            profileModal.classList.remove('hidden');
            loadProfileSettings();
        });

        if (closeProfile) {
            closeProfile.addEventListener('click', () => {
                profileModal.classList.add('hidden');
            });
        }

        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.add('hidden');
            }
        });

        const profileTabs = profileModal.querySelectorAll('.profile-tab');
        const tabContents = profileModal.querySelectorAll('.profile-tab-content');

        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                profileTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');

                if (targetTab === 'personal') {
                    document.getElementById('personalTab').classList.add('active');
                } else if (targetTab === 'game') {
                    document.getElementById('gameTab').classList.add('active');
                }
            });
        });

        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                saveProfileSettings();
                profileModal.classList.add('hidden');
            });
        }
    }

    function loadProfileSettings() {
        const displayName = currentUser?.displayName || '';
        const userEmail = currentUser?.email || '';

        document.getElementById('displayName').value = displayName;
        document.getElementById('userEmail').value = userEmail;

        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        difficultyRadios.forEach(radio => {
            if (radio.value === userData.difficultyLevel) {
                radio.checked = true;
            }
        });
    }

    async function saveProfileSettings() {
        const displayName = document.getElementById('displayName').value;

        if (currentUser && displayName !== currentUser.displayName) {
            try {
                await updateProfile(currentUser, { displayName });
                userData.displayName = displayName;
                await userData.saveToFirebase(currentUser.uid);
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        }

        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
        if (selectedDifficulty) {
            userData.setDifficultyLevel(selectedDifficulty.value);
        }

        const saveBtn = document.getElementById('saveProfileBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = 'Saved! ✓';
        saveBtn.style.background = 'var(--success-green)';

        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    generateLeaderboard();
}

// Initialize the home page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, checking for startButton...');
        if (document.getElementById('startButton')) {
            console.log('StartButton found, initializing home page');
            initHomePage();
        } else {
            console.log('StartButton not found - not on home page');
        }
    });
} else {
    console.log('DOM already ready, checking for startButton...');
    if (document.getElementById('startButton')) {
        console.log('StartButton found, initializing home page');
        initHomePage();
    } else {
        console.log('StartButton not found - not on home page');
    }
}

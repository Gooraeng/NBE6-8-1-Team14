export interface SplitAddressResult {
    baseAddress: string;
    extraAddress: string;
}

export const checkElement = (input: HTMLInputElement, field: string, setModalMessage?: (message: string) => void, setShowModal?: (show: boolean) => void) => {
    if (!input) {
        const message = `${field}을(를) 입력해주세요.`;
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        return true;
    }

    input.value = input.value.trim();

    if (input.value.length < 2) {
        const message = `${field}을(를) 2자 이상 입력해주세요.`;
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        input.focus();
        return true;
    }

    return false;
}

export const checkSpace = (input: HTMLInputElement, field: string, setModalMessage?: (message: string) => void, setShowModal?: (show: boolean) => void) => {
    if (checkElement(input, field, setModalMessage, setShowModal)) return true;

    if (input.value.includes(" ")) {
        const message = `${field}에 띄어쓰기를 쓸 수 없습니다.`;
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        input.focus();
        return true;
    }

    return false;
}

export const checkPassword = (passwordInput : HTMLInputElement, passwordConfirmationInput : HTMLInputElement, setModalMessage?: (message: string) => void, setShowModal?: (show: boolean) => void) => {
    if (passwordInput.value !== passwordConfirmationInput.value) {
        const message = "비밀번호가 일치하지 않습니다. 다시 입력해주세요!";
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        passwordInput.focus();
        return true;
    }

    return false;
}

export const checkNullableElement = (input: HTMLInputElement, field: string, setModalMessage?: (message: string) => void, setShowModal?: (show: boolean) => void) => {
    // 앞뒤 공백 제거 후, 2자 이상 붙은 공백을 하나로 줄이는 작업
    input.value = input.value?.trim()
        .replaceAll(/\s{2,}/g, " ");

    if (input.value.length > 0 && input.value.length < 2) {
        const message = `${field}을(를) 2자 이상 입력해주세요.`;
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        input.focus();
        return true;
    }

    return false;
}

export const checkAddress = (baseAddress: HTMLInputElement, extraAddress: HTMLInputElement, setModalMessage?: (message: string) => void, setShowModal?: (show: boolean) => void) => {
    if (baseAddress.value.length == 0 && extraAddress.value.length !== 0) {
        const message = "상세주소만 입력하실 수 없습니다.";
        if (setModalMessage && setShowModal) {
            setModalMessage(message);
            setShowModal(true);
        } else {
            alert(message);
        }
        extraAddress.focus();
        return true;
    }

    return false;
}

export const concatAddress = (baseAddress: HTMLInputElement, extraAddress: HTMLInputElement)=> {
    if (extraAddress.value.length > 0) {
        return baseAddress.value.concat(", ", extraAddress.value);
    }

    return baseAddress.value;
}

export const splitAddress = (address: string): SplitAddressResult => {
    if (!address || address.trim().length === 0) {
        return {
            baseAddress: "",
            extraAddress: ""
        };
    }

    const addressArray = address.split(", ", 2);
    
    return {
        baseAddress: addressArray.length >= 1 ? addressArray[0] : "",
        extraAddress: addressArray.length >= 2 ? addressArray[1] : ""
    };
}
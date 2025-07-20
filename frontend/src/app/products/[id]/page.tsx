"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { TiShoppingCart } from "react-icons/ti"
import { IoSettingsOutline, IoTrashOutline } from "react-icons/io5"
import { IoAdd, IoRemove } from "react-icons/io5"
import { FiCreditCard } from "react-icons/fi"
import { useProducts } from "@/hooks/useProducts"
import { useAuthContext } from "@/hooks/useAuth"
import { PaymentData } from "@/types/dev/payment"
import ConfirmModal from "@/components/modal/ConfirmModal";
import { del } from "@/lib/fetcher";

// 상품 상세 페이지 컴포넌트
export default function ProductDetail() {
    const params = useParams()
    const router = useRouter()
    const { products, loading, error } = useProducts()
    const { getUserRole } = useAuthContext()
    const userRole = getUserRole()
    const [quantity, setQuantity] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteResultModal, setDeleteResultModal] = useState<{show: boolean, message: string, type: "success" | "error"}>({show: false, message: "", type: "success"});

    // 현재 상품 정보 추출
    const productId = Number(params.id)
    const product = products?.find(p => p.id === productId)

    // 수량 변경 핸들러
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 1)) {
            setQuantity(newQuantity);
        }
    };

    // 장바구니 담기 버튼 클릭 핸들러
    const handleCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (userRole === 'GUEST') {
            alert("장바구니 기능을 사용하려면 로그인이 필요합니다.");
            return;
        }
        if (userRole === 'USER') {
            const totalPrice = new Intl.NumberFormat("ko-KR").format((product?.price || 0) * quantity);
            alert(`${product?.name} ${quantity}개가 장바구니에 담겼습니다!\n총 금액: ${totalPrice}원`);
            return;
        }
    };

    // 바로 구매 버튼 클릭 핸들러
    const handleBuyNowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (userRole === 'GUEST') {
            alert("구매 기능을 사용하려면 로그인이 필요합니다.");
            return;
        }
        if (userRole === 'USER') {
            const totalPrice = new Intl.NumberFormat("ko-KR").format((product?.price || 0) * quantity);
            alert(`${product?.name} ${quantity}개를 바로 구매합니다!\n총 금액: ${totalPrice}원\n\n결제 페이지로 이동합니다.`);
            const paymentData: PaymentData = {
                items: [{ id: product?.id || 0, count: quantity }],
                totalPrice: Number(totalPrice),
                fromCart : false
            }
            sessionStorage.setItem("paymentData", JSON.stringify(paymentData))
            router.push("/payment")
            return;
        }
    };

    // 관리자 상품 설정 버튼 클릭 시 수정 페이지로 이동
    const handleSettingsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product) return;
        router.push(`/products/${product.id}/edit`);
    };

    // 상품 삭제 버튼 클릭 시 상품 삭제
    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (userRole === 'GUEST') {
            alert("상품 삭제 기능을 사용하려면 로그인이 필요합니다.");
            return;
        }
        if (userRole === 'ADMIN') {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteModal(true);
        } else {
            alert("상품 삭제 권한이 없습니다.");
            return;
        }
    };

    // 삭제 모달 확인 핸들러
    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        if (!product) return;
        // 상품 삭제 요청
        const response = await del(`/api/products/${product.id}`);
        if (response.error) {
            setDeleteResultModal({show: true, message: `상품 삭제에 실패했습니다.\n${response.error}`, type: "error"});
        } else {
            setDeleteResultModal({show: true, message: "상품이 성공적으로 삭제되었습니다!", type: "success"});
        }
    };
    // 삭제 결과 모달 확인 핸들러
    const handleDeleteResultConfirm = () => {
        setDeleteResultModal({show: false, message: "", type: "success"});
        if (deleteResultModal.type === "success") {
            // 삭제 성공 시 메인 페이지로 이동
            router.replace("/");
        }
    };
    // 삭제 모달 취소 핸들러
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    // 로딩/에러/상품 없음 처리
    if (loading) return <div className="p-8">로딩중...</div>
    if (error) return <div className="p-8 text-red-500">{error}</div>
    if (!product) return <div className="p-8">상품을 찾을 수 없습니다.</div>

    // 비관리자 접근 시 품절 상품 접근 제한
    if (product.stockQuantity <= 0 && userRole !== 'ADMIN') {
        return (
            <main className="max-w-[1280px] mx-auto bg-white">
                <div className="p-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        ← 목록으로
                    </button>
                    <div className="max-w-md mx-auto text-center py-16">
                        {/* 품절 아이콘 및 안내 */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">품절된 상품입니다</h1>
                        <p className="text-gray-600 mb-6">이 상품은 현재 품절 상태입니다.</p>
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
                            <p className="text-gray-600 text-sm">재고가 소진되어 구매할 수 없습니다.</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            다른 상품 보기
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    const formattedPrice = new Intl.NumberFormat("ko-KR").format(product.price)

    // 상품 상세 정보 렌더링
    return (
        <>
            {showDeleteModal && (
                <ConfirmModal
                    message="해당 상품을 삭제하시겠습니까?"
                    confirmText="삭제"
                    cancelText="취소"
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}
            {deleteResultModal.show && (
                <ConfirmModal
                    message={deleteResultModal.message}
                    confirmText="확인"
                    onConfirm={handleDeleteResultConfirm}
                    onCancel={handleDeleteResultConfirm}
                />
            )}
            <main className="max-w-[1280px] mx-auto bg-white">
                <div className="px-4 py-8">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        ← 목록으로
                    </button>
                    <div className="grid grid-cols-2 gap-12">
                        {/* 상품 이미지 */}
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                            <Image
                                src={product.imagePath || "/placeholder.svg"}
                                alt={product.name}
                                width={600}
                                height={600}
                                className="h-full w-full object-contain object-center"
                            />
                        </div>
                        {/* 상품 정보 */}
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                            <p className="text-2xl font-semibold text-gray-900 mb-6">{formattedPrice}원</p>
                            {/* 재고 정보 */}
                            <div className="mb-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    product.stockQuantity <= 0
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                }`}>
                                    {product.stockQuantity <= 0 ? "품절" : `재고: ${product.stockQuantity}개`}
                                </span>
                            </div>
                            {/* 상품 설명 */}
                            {product.description && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold mb-3">상품 설명</h2>
                                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                            {/* 수량 선택 (일반 사용자만) */}
                            {userRole === 'USER' && product.stockQuantity > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold mb-3">수량 선택</h2>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                                className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <IoRemove className="w-4 h-4" />
                                            </button>
                                            <span className="px-4 py-2 text-lg font-medium min-w-[60px] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={quantity >= product.stockQuantity}
                                                className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <IoAdd className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            최대 {product.stockQuantity}개
                                        </span>
                                    </div>
                                    {/* 총 금액 표시 */}
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">총 금액:</span>
                                            <span className="text-xl font-bold text-gray-900">
                                                {new Intl.NumberFormat("ko-KR").format(product.price * quantity)}원
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* 권한별 버튼 */}
                            <div className="mt-auto space-y-3">
                                {userRole === 'ADMIN' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSettingsClick}
                                            className="w-full px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                        >
                                            <IoSettingsOutline className="w-5 h-5 mr-2" />
                                            상품 설정
                                        </button>
                                        {/* 상품 삭제 버튼 */}
                                        <button
                                            onClick={handleDeleteClick}
                                            className="w-full px-6 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                        >
                                            <IoTrashOutline className="w-5 h-5 mr-2" />
                                            상품 삭제
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* 구매하기 버튼 */}
                                        <button
                                            onClick={handleBuyNowClick}
                                            disabled={product.stockQuantity <= 0}
                                            className={`w-full px-6 py-3 rounded-lg flex items-center justify-center transition-colors ${
                                                product.stockQuantity <= 0
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-green-600 text-white hover:bg-green-700"
                                            }`}
                                        >
                                            <FiCreditCard className="w-5 h-5 mr-2" />
                                            {product.stockQuantity <= 0 ? "품절" : "바로 구매하기"}
                                        </button>
                                        {/* 장바구니에 담기 버튼 */}
                                        <button
                                            onClick={handleCartClick}
                                            disabled={product.stockQuantity <= 0}
                                            className={`w-full px-6 py-3 rounded-lg flex items-center justify-center transition-colors ${
                                                product.stockQuantity <= 0
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                        >
                                            <TiShoppingCart className="w-5 h-5 mr-2" />
                                            {product.stockQuantity <= 0 ? "품절" : "장바구니에 담기"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
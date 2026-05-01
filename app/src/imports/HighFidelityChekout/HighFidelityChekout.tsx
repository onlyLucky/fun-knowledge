import svgPaths from "./svg-pxwm5shmp5";
import imgProduct1 from "./614453ef068eb58d25fd4f9e006121cffd52fcae.png";
import imgProductCart from "./f6694b845970a6c9f1f73259156265e2c4c85103.png";
import imgVisaPict from "./f25f590d46490ff97a46c410f72835a973678175.png";

function VuesaxOutlineArrowDown() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/arrow-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-down">
          <path d={svgPaths.p336ed396} id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d={svgPaths.p1a4bb100} id="Vector_2" opacity="0" stroke="var(--stroke-0, #292526)" />
        </g>
      </svg>
    </div>
  );
}

function Back() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[32px] shrink-0" data-name="Back">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="flex items-center justify-center relative shrink-0 size-[24px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="relative size-[24px]" data-name="Main Icon">
            <VuesaxOutlineArrowDown />
          </div>
        </div>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="content-stretch flex items-start p-[8px] relative rounded-[32px] shrink-0" data-name="Menu">
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Main Icon">
        <div className="absolute h-[8px] left-[6px] top-[8px] w-[12px]" data-name="vuesax/outline/menu">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 8">
            <path d={svgPaths.p101cbd00} fill="var(--fill-0, #292526)" id="vuesax/outline/menu" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Checkout() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[89px] items-center justify-center left-1/2 px-[24px] py-[16px] top-[68px] w-[375px]" data-name="Checkout">
      <Back />
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.4] relative shrink-0 text-[#121111] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Checkout
      </p>
      <Menu />
    </div>
  );
}

function ProductCart() {
  return (
    <div className="bg-white overflow-clip relative rounded-[14px] shrink-0 size-[70px]" data-name="Product Cart">
      <div className="absolute inset-[-3.57%_0_-20.71%_0]" data-name="Product 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProduct1} />
      </div>
    </div>
  );
}

function Headline() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="headline">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Modern light clothes
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress modern
      </p>
    </div>
  );
}

function Detail1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="Detail">
      <Headline />
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#292526] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        $162.99
      </p>
    </div>
  );
}

function Menu1() {
  return (
    <div className="absolute h-[4px] left-[4px] top-[10px] w-[16px]" data-name="menu1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 4">
        <g id="menu1">
          <circle cx="2" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 2" r="2" />
          <circle cx="8" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 3" r="2" />
          <circle cx="14" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 4" r="2" />
        </g>
      </svg>
    </div>
  );
}

function VuesaxOutlineMenu() {
  return (
    <div className="absolute contents left-[4px] top-[10px]" data-name="vuesax/outline/menu1">
      <Menu1 />
    </div>
  );
}

function DefaultLinearMinus() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/minus">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="minus">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Minus() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[24px]" data-name="Minus">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearMinus />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function DefaultLinearAdd() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/add">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="add">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 12V4" id="Vector_2" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Add() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[24px]" data-name="Add">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearAdd />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function AddItem() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Add Item">
      <Minus />
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] relative shrink-0 text-[#292526] text-[14px] w-[7px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        1
      </p>
      <Add />
    </div>
  );
}

function AddItemSetting() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-end relative shrink-0" data-name="Add Item + Setting">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Main Icon">
        <VuesaxOutlineMenu />
      </div>
      <AddItem />
    </div>
  );
}

function Detail() {
  return (
    <div className="content-stretch flex gap-[28px] items-center justify-center relative shrink-0" data-name="Detail">
      <Detail1 />
      <AddItemSetting />
    </div>
  );
}

function Cart1() {
  return (
    <div className="absolute content-stretch flex gap-[15px] items-center left-[24px] top-[282px]" data-name="Cart 2">
      <ProductCart />
      <Detail />
    </div>
  );
}

function ProductCart2() {
  return (
    <div className="absolute h-[118px] left-[-13px] top-[-9px] w-[95px]" data-name="Product Cart">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgProductCart} />
    </div>
  );
}

function ProductCart1() {
  return (
    <div className="bg-white overflow-clip relative rounded-[14px] shrink-0 size-[70px]" data-name="Product Cart">
      <ProductCart2 />
    </div>
  );
}

function Headline1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Headline">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Modern light clothes
      </p>
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#787676] text-[10px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Dress modern
      </p>
    </div>
  );
}

function Detail3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="Detail">
      <Headline1 />
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#292526] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        $212.99
      </p>
    </div>
  );
}

function Menu2() {
  return (
    <div className="absolute h-[4px] left-[4px] top-[10px] w-[16px]" data-name="menu1">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 4">
        <g id="menu1">
          <circle cx="2" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 2" r="2" />
          <circle cx="8" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 3" r="2" />
          <circle cx="14" cy="2" fill="var(--fill-0, #292526)" id="Ellipse 4" r="2" />
        </g>
      </svg>
    </div>
  );
}

function VuesaxOutlineMenu1() {
  return (
    <div className="absolute contents left-[4px] top-[10px]" data-name="vuesax/outline/menu1">
      <Menu2 />
    </div>
  );
}

function DefaultLinearMinus1() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/minus">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="minus">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_2" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Minus1() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[24px]" data-name="Minus">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearMinus1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function DefaultLinearAdd1() {
  return (
    <div className="absolute contents inset-0" data-name="default/linear/add">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="add">
          <path d="M4 8H12" id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 12V4" id="Vector_2" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Vector_3" opacity="0" />
        </g>
      </svg>
    </div>
  );
}

function Add1() {
  return (
    <div className="relative rounded-[32px] shrink-0 size-[24px]" data-name="Add">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="Default Icon">
          <DefaultLinearAdd1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#dfdede] border-solid inset-0 pointer-events-none rounded-[32px]" />
    </div>
  );
}

function AddItem1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0" data-name="Add Item">
      <Minus1 />
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.2] relative shrink-0 text-[#292526] text-[14px] w-[7px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        4
      </p>
      <Add1 />
    </div>
  );
}

function AddItemSetting1() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-end relative shrink-0" data-name="Add Item + Setting">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Main Icon">
        <VuesaxOutlineMenu1 />
      </div>
      <AddItem1 />
    </div>
  );
}

function Detail2() {
  return (
    <div className="content-stretch flex gap-[28px] items-center justify-center relative shrink-0" data-name="Detail">
      <Detail3 />
      <AddItemSetting1 />
    </div>
  );
}

function Cart() {
  return (
    <div className="absolute content-stretch flex gap-[15px] items-center left-[24px] top-[164px]" data-name="Cart 1">
      <ProductCart1 />
      <Detail2 />
    </div>
  );
}

function CartView() {
  return (
    <div className="-translate-x-1/2 absolute bg-white h-[408px] left-1/2 overflow-clip top-0 w-[375px]" data-name="Cart View">
      <Checkout />
      <div className="absolute h-0 left-[24px] top-[376px] w-[327px]" data-name="Stripe">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
            <line id="Stripe" stroke="var(--stroke-0, #F6F6F6)" x2="327" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Cart1 />
      <div className="absolute h-0 left-[24px] top-[258px] w-[327px]" data-name="Stripe">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
            <line id="Stripe" stroke="var(--stroke-0, #F6F6F6)" x2="327" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Cart />
    </div>
  );
}

function SubTotal() {
  return (
    <div className="absolute content-stretch flex gap-[209px] items-center justify-center leading-[normal] left-[24px] text-[14px] top-[264px] whitespace-nowrap" data-name="Sub Total">
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#292526]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Sub Total
      </p>
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
        $1,014.95
      </p>
    </div>
  );
}

function Total() {
  return (
    <div className="content-stretch flex gap-[178px] items-center justify-center relative shrink-0" data-name="Total">
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#292526]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Total (9 items)
      </p>
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#171516] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
        $1,014.95
      </p>
    </div>
  );
}

function Shipping() {
  return (
    <div className="content-stretch flex gap-[206px] items-center justify-center relative shrink-0" data-name="Shipping">
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#292526]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Shipping Fee
      </p>
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
        $.0.00
      </p>
    </div>
  );
}

function Discount() {
  return (
    <div className="content-stretch flex gap-[230px] items-center justify-center relative shrink-0" data-name="Discount">
      <p className="font-['Encode_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[#292526]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Discount
      </p>
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold relative shrink-0 text-[#121111] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
        $.0.00
      </p>
    </div>
  );
}

function TotalPrice() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] items-start leading-[normal] left-[24px] text-[14px] top-[146px] whitespace-nowrap" data-name="Total Price">
      <Total />
      <Shipping />
      <Discount />
    </div>
  );
}

function VisaMaster() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Visa/master">
      <div className="h-[30px] relative shrink-0 w-[45px]" data-name="Default Icon">
        <div className="absolute inset-0 rounded-[4px]" data-name="VISA_PICT">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
            <img alt="" className="absolute h-[170.67%] left-[-3.33%] max-w-none top-[-35.33%] w-[106.67%]" src={imgVisaPict} />
          </div>
        </div>
      </div>
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[0] relative shrink-0 text-[#292526] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="leading-[1.4]">{`**** **** **** `}</span>
        <span className="font-['Encode_Sans:Regular',sans-serif] font-normal leading-[1.4]" style={{ fontVariationSettings: "'wdth' 100" }}>
          2143
        </span>
      </p>
    </div>
  );
}

function VuesaxOutlineArrowDown1() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/outline/arrow-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="arrow-down">
          <path d={svgPaths.p1134a680} id="Vector" stroke="var(--stroke-0, #292526)" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
          <path d={svgPaths.p304c5900} id="Vector_2" opacity="0" stroke="var(--stroke-0, #292526)" />
        </g>
      </svg>
    </div>
  );
}

function DetailCard() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[20px] top-[16px] w-[287px]" data-name="Detail Card">
      <VisaMaster />
      <div className="relative shrink-0 size-[20px]" data-name="Main Icon">
        <VuesaxOutlineArrowDown1 />
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-[#f2f2f2] h-[62px] overflow-clip relative rounded-[8px] shrink-0 w-[327px]" data-name="Card">
      <DetailCard />
    </div>
  );
}

function Payment() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-[24px] top-[24px]" data-name="Payment">
      <p className="font-['Encode_Sans:SemiBold',sans-serif] font-semibold leading-[1.4] relative shrink-0 text-[#121111] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Shipping Information
      </p>
      <Card />
    </div>
  );
}

function DetailPrice() {
  return (
    <div className="-translate-x-1/2 absolute bg-white bottom-0 h-[418px] left-1/2 overflow-clip w-[375px]" data-name="Detail Price">
      <div className="-translate-x-1/2 absolute bg-[#292526] bottom-[32px] content-stretch flex items-center justify-center left-1/2 px-[16px] py-[20px] rounded-[45px] w-[327px]" data-name="Button">
        <p className="font-['Encode_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[#fdfdfd] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Pay
        </p>
      </div>
      <SubTotal />
      <div className="-translate-x-1/2 absolute h-0 left-1/2 top-[240px] w-[327px]" data-name="Stripe">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 327 1">
            <line id="Stripe" stroke="var(--stroke-0, #F2F2F2)" x2="327" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <TotalPrice />
      <Payment />
    </div>
  );
}

function Battery() {
  return (
    <div className="absolute contents right-[24.67px] top-[17.33px]" data-name="Battery">
      <div className="absolute h-[11.333px] right-[27px] top-[17.33px] w-[22px]" data-name="Rectangle">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 11.3333">
          <path d={svgPaths.p7e6b880} id="Rectangle" opacity="0.35" stroke="var(--stroke-0, black)" />
        </svg>
      </div>
      <div className="absolute h-[4px] right-[24.67px] top-[21px] w-[1.328px]" data-name="Combined Shape">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.32804 4">
          <path d={svgPaths.p32d253c0} fill="var(--fill-0, black)" id="Combined Shape" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute h-[7.333px] right-[29px] top-[19.33px] w-[18px]" data-name="Rectangle">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 7.33333">
          <path d={svgPaths.p3544af00} fill="var(--fill-0, black)" id="Rectangle" />
        </svg>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="absolute contents right-[24.67px] top-[17.33px]" data-name="Right Side">
      <Battery />
      <div className="absolute h-[10.966px] right-[54.03px] top-[17.33px] w-[15.272px]" data-name="Wifi">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.2725 10.966">
          <path d={svgPaths.p3d78f640} fill="var(--fill-0, black)" id="Wifi" />
        </svg>
      </div>
      <div className="absolute h-[10.667px] right-[74.33px] top-[17.67px] w-[17px]" data-name="Mobile Signal">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 10.667">
          <path d={svgPaths.p26d17600} fill="var(--fill-0, black)" id="Mobile Signal" />
        </svg>
      </div>
    </div>
  );
}

function Time() {
  return (
    <div className="absolute h-[21px] left-[12px] top-[12px] w-[52px]" data-name="Time">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 21">
        <g id="Time">
          <g id="9:41">
            <path d={svgPaths.p2b8d6300} fill="var(--fill-0, black)" />
            <path d={svgPaths.p23f4f800} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2c24a7c0} fill="var(--fill-0, black)" />
            <path d={svgPaths.p823e200} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LeftSide() {
  return (
    <div className="absolute contents left-[12px] top-[12px]" data-name="Left Side">
      <Time />
    </div>
  );
}

export default function HighFidelityChekout() {
  return (
    <div className="bg-white relative size-full" data-name="High-Fidelity ( Chekout )">
      <CartView />
      <DetailPrice />
      <div className="absolute h-[44px] left-0 overflow-clip top-0 w-[375px]" data-name="Iphone">
        <RightSide />
        <LeftSide />
      </div>
      <div className="-translate-x-1/2 absolute bottom-0 h-[59px] left-1/2 w-[375px]" data-name="Iphone">
        <div className="-translate-x-1/2 absolute bg-[#101010] bottom-[8px] h-[5px] left-[calc(50%+0.5px)] rounded-[100px] w-[134px]" data-name="Home Indicator" />
      </div>
    </div>
  );
}
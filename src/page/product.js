import { Button, Group, Modal, Select, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Pencil, X } from 'tabler-icons-react';
import SelectProducts from '../components/SelectProducts';

const Product = () => {
    const [openModel, setOpenModel] = useState(false);
    const [products, setProducts] = useState([]);
    const [openVariants, setOpenVariants] = useState([]);
    const [editingProductIndex, setEditingProductIndex] = useState(null);
    const [draggingProductIndex, setDraggingProductIndex] = useState(null);
    const [discounts, setDiscounts] = useState({});

    const handleProductDragStart = (event, index) => {
        event.stopPropagation();
        setDraggingProductIndex(index);
        event.dataTransfer.setData("draggedProductIndex", index);
    };

    const handleProductDrop = (event, index) => {
        event.preventDefault();
        const sourceIndex = parseInt(event.dataTransfer.getData("draggedProductIndex"), 10);
        if (sourceIndex === index || draggingProductIndex === null) return;

        const updatedProducts = [...products];
        const [movedProduct] = updatedProducts.splice(sourceIndex, 1);
        updatedProducts.splice(index, 0, movedProduct);
        setProducts(updatedProducts);
        setDraggingProductIndex(null);
    };

    const handleProductDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleEditProduct = (index) => {
        setEditingProductIndex(index);
        setOpenModel(true);
    };

    const handleAddProduct = () => {
        if (products?.length > 0) {
            setProducts([
                ...products,
                {
                    id: Date.now(),
                    title: "Select Product",
                    selectedVariants: [],
                },
            ]);
        }
    };

    const handleSelectProducts = (newProducts) => {
        if (editingProductIndex !== null) {
            setProducts((prevProducts) => {
                const updatedProducts = [...prevProducts];
                updatedProducts.splice(editingProductIndex, 1, ...newProducts);
                return updatedProducts;
            });
        } else {
            setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        }

        setEditingProductIndex(null);
        setOpenModel(false);
    };

    const toggleVariants = (index) => {
        setOpenVariants((prev) => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };


    const handleVariantDragStart = (event, productIndex, variantIndex) => {
        event.stopPropagation();
        setDraggingProductIndex(productIndex);

        event.dataTransfer.setData("productIndex", productIndex);
        event.dataTransfer.setData("variantIndex", variantIndex);
        event.dataTransfer.setDragImage(event.target, 0, 0);
    };

    const handleVariantDrop = (event, productIndex, variantIndex) => {
        const sourceProductIndex = parseInt(event.dataTransfer.getData("productIndex"), 10);
        const sourceVariantIndex = parseInt(event.dataTransfer.getData("variantIndex"), 10);

        if (sourceProductIndex !== productIndex) return;

        const updatedProducts = [...products];
        const sourceVariant = updatedProducts[productIndex].selectedVariants[sourceVariantIndex];

        updatedProducts[productIndex].selectedVariants.splice(sourceVariantIndex, 1);

        updatedProducts[productIndex].selectedVariants.splice(variantIndex, 0, sourceVariant);

        setProducts(updatedProducts);
        setDraggingProductIndex(null);

    };

    const handleVariantDragOver = (event) => {
        event.preventDefault();
    };
    const handleRemoveProduct = (index) => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
    };

    const handleRemoveVariant = (productIndex, variantIndex) => {
        const updatedProducts = [...products];
        updatedProducts[productIndex].selectedVariants = updatedProducts[productIndex].selectedVariants.filter(
            (_, i) => i !== variantIndex
        );
        setProducts(updatedProducts);
    };

    const handleShowDiscountForm = (index, type) => {
        const updatedDiscounts = { ...discounts };
        updatedDiscounts[index] = { type, value: updatedDiscounts[index]?.value || 20 }; // Default value 20
        setDiscounts(updatedDiscounts);
    };

    const handleDiscountValueChange = (index, value) => {
        const updatedDiscounts = { ...discounts };
        updatedDiscounts[index].value = value;
        setDiscounts(updatedDiscounts);
    };

    const handleDiscountTypeChange = (index, value) => {
        const updatedDiscounts = { ...discounts };
        updatedDiscounts[index].type = value;
        setDiscounts(updatedDiscounts);
    };
    const handleVariantDiscountValueChange = (productIndex, variantIndex, value) => {
        const updatedProducts = [...products];
        const updatedVariant = { ...updatedProducts[productIndex].selectedVariants[variantIndex] };
        updatedVariant.discountValue = value;
        updatedProducts[productIndex].selectedVariants[variantIndex] = updatedVariant;
        setProducts(updatedProducts);
    };

    const handleVariantDiscountTypeChange = (productIndex, variantIndex, value) => {
        const updatedProducts = [...products];
        const updatedVariant = { ...updatedProducts[productIndex].selectedVariants[variantIndex] };
        updatedVariant.discountType = value;
        updatedProducts[productIndex].selectedVariants[variantIndex] = updatedVariant;
        setProducts(updatedProducts);
    };

    return (
        <div>
            <Modal
                opened={openModel}
                onClose={() => {
                    setEditingProductIndex(null);
                    setOpenModel(false);
                }}
                title="Select Products"
                centered
                size="lg"

            >
                <SelectProducts products={products} setProducts={handleSelectProducts} setOpenModel={setOpenModel} />
            </Modal>
            <div className="py-4 font-bold pl-6">Add Products</div>
            <div>
                <div className="flex flex-col w-full gap-4 min-w-[452px]">
                    <div className="flex items-center pl-5 font-medium">
                        <div className='min-w-12'></div>
                        <div className="w-1/2">Product</div>
                        <div className={`text-left pl-10 ${products.length > 0 ? 'pl-0' : 'pl-10'}`}>Discount</div>
                    </div>

                    {products.length === 0 && (
                        <div className="flex items-center gap-4">
                            <GripVertical size={18} strokeWidth={1} color="grey" />
                            <div className="flex items-center mt-1">1.</div>
                            <div
                                className="flex items-center p-1 border border-gray-300 rounded-md w-60 bg-white h-9 shadow-lg cursor-pointer"
                                onClick={() => setOpenModel(true)}
                            >
                                <span className="text-sm font-medium justify-between pl-2 flex w-full text-gray-500">
                                    Select Product
                                </span>
                                <Pencil size={20} strokeWidth={2} color="gray" />
                            </div>
                            <div className="flex-1">
                                <Group position="center">
                                    <Button style={{ background: '#008060' }} radius="sm" color="teal">Add Discount</Button>
                                </Group>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {products?.length > 0 &&
                            products.map((product, index) => (
                                <div key={product?.id}
                                    draggable
                                    onDragStart={(e) => handleProductDragStart(e, index)}
                                    onDragOver={handleProductDragOver}
                                    onDrop={(e) => handleProductDrop(e, index)}
                                    className='cursor-grab'>
                                    <div className="p-0">
                                        <div className="flex items-center gap-2 justify-between">
                                            <GripVertical size={18} strokeWidth={1} color="grey" />
                                            <div className="flex items-center mt-1">{index + 1}.</div>
                                            <div
                                                className="flex items-center p-1 border border-gray-300 rounded-md bg-white w-48 h-9 shadow-lg cursor-pointer"
                                                onClick={() => handleEditProduct(index)}
                                            >
                                                <span className="text-sm font-medium justify-between pl-2 flex w-full whitespace-nowrap overflow-hidden">
                                                    {product?.title}
                                                </span>
                                                <Pencil size={20} strokeWidth={2} color="black" />
                                            </div>
                                            <div className="flex">
                                                <Group position="center">
                                                    {discounts[index] ? (
                                                        <div className="flex gap-2">
                                                            <TextInput
                                                                value={discounts[index].value}
                                                                onChange={(e) => handleDiscountValueChange(index, e.target.value)}
                                                                type="number"
                                                                style={{ width: '50px' }}
                                                            />
                                                            <Select
                                                                value={discounts[index].type}
                                                                onChange={(value) => handleDiscountTypeChange(index, value)}
                                                                data={[
                                                                    { value: 'percentage', label: '% Off' },
                                                                    { value: 'flat', label: 'flat off' },
                                                                ]}
                                                                size='sm'
                                                                style={{ width: '100px' }}
                                                                rightSection={<ChevronDown
                                                                    size={20} color='gray' />}
                                                            />
                                                        </div>
                                                    ) : (

                                                        <Button
                                                            onClick={() => handleShowDiscountForm(index, 'percentage')}
                                                            style={{ background: '#008060' }}
                                                            color="teal"
                                                        >
                                                            Add Discount
                                                        </Button>
                                                    )}
                                                </Group>
                                            </div>
                                            <X onClick={() => { handleRemoveProduct(index) }} cursor="pointer" size={20} color='gray' />
                                        </div>

                                        <div
                                            onClick={() => toggleVariants(index)}
                                            className="cursor-pointer text-[#006EFF] underline text-sm mt-3 flex justify-end"
                                        >
                                            {openVariants[index] ?
                                                <div className='flex'>Hide variants {<ChevronUp size={20} />}</div> :
                                                <div className='flex'> Show variants {<ChevronDown size={20} />}</div>}
                                        </div>

                                        {openVariants[index] && (
                                            <div className="text-gray-600 mt-1">
                                                {product?.selectedVariants?.length > 0 ? (
                                                    <div>
                                                        {product?.selectedVariants.map((variant, variantIndex) => (
                                                            <div
                                                                key={variant?.id}
                                                                className="flex items-center pl-16 text-base font-medium p-4 py-2 pr-0 gap-2 "
                                                                draggable
                                                                onDragStart={(e) => handleVariantDragStart(e, index, variantIndex)}
                                                                onDragOver={handleVariantDragOver}
                                                                onDrop={(e) => handleVariantDrop(e, index, variantIndex)}
                                                            >
                                                                <div className="cursor-pointer">
                                                                    <GripVertical
                                                                        size={18}
                                                                        strokeWidth={1}
                                                                        color="grey"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-5 text-[#000000CC]">
                                                                    <div className='bg-white px-3 py-1 rounded-2xl border border-solid  border-gray-300 whitespace-nowrap text-sm overflow-hidden overflow-ellipsis w-[148px]'>{variant?.title}</div>
                                                                    <div className="flex gap-10">
                                                                        <div className="flex gap-2">
                                                                            <TextInput
                                                                                value={variant?.discountValue || "20"}
                                                                                onChange={(e) =>
                                                                                    handleVariantDiscountValueChange(index, variantIndex, e.target.value)
                                                                                }

                                                                                radius="xl"
                                                                                type='number'
                                                                                style={{ width: '80px', minWidth: "80px" }}
                                                                            />
                                                                            <Select
                                                                                value={variant?.discountType || "percentage"}
                                                                                onChange={(value) =>
                                                                                    handleVariantDiscountTypeChange(index, variantIndex, value)
                                                                                }
                                                                                data={[
                                                                                    { value: 'percentage', label: '% off' },
                                                                                    { value: 'flat', label: 'flat off' },
                                                                                ]}
                                                                                defaultValue={"percentage"}
                                                                                placeholder="Discount Value"
                                                                                size='sm'
                                                                                radius="xl"
                                                                                style={{ width: '100px' }}
                                                                                rightSection={<ChevronDown
                                                                                    size={20} color='gray' />}
                                                                            />


                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <X onClick={() => { handleRemoveVariant(index, variantIndex) }} className='cursor-pointer' size={20} color='gray' />

                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-red-500">No variants available</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="flex justify-end pt-5 text-base pb-2">
                    <div className='w-[193px]'>
                        <Button variant="outline" fullWidth="100%" style={{ borderColor: '#008060', fontSize: '16px', borderWidth: '2px', color: '#008060' }} size="lg" color="teal" onClick={handleAddProduct}>
                            Add Product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;


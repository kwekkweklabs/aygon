import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Textarea } from '@heroui/react'
import React, { useState } from 'react'
import ImageUpload from '../elements/ImageUpload';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';

export default function CreateHeroButton({
  refetchHero
}) {
  const { accessToken } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!name || !description || !imageUrl) {
        setError('Please fill all fields');
        return;
      }

      if (description.length > 50) {
        setError('Description must be less than 50 characters');
        return;
      }

      setError(null);

      // Call API to create hero
      // await sdk.createHero({
      //   name,
      //   description,
      //   image: imageUrl
      // });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/hero/create`,
        {
          name,
          description,
          imageUrl: imageUrl
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      console.log('Create hero response:', res.data);

      refetchHero();
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating hero:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        size='lg'
        onPress={() => setOpenCreateDialog(true)}
      >
        Create Hero
      </Button>

      <Modal
        isOpen={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
        title='Create Hero'
        className='dark'
      >
        <ModalContent>
          <ModalHeader>
            Create Hero
          </ModalHeader>
          <ModalBody className='mb-4'>
            <div className='flex flex-col gap-4'>
              <ImageUpload
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
              />

              <Input
                title='Name'
                label='Name'
                placeholder='Enter your epic hero name'
                type='text'
                labelPlacement='outside'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div>
                <Textarea
                  title='Description'
                  label='Description'
                  placeholder='Enter your hero description. 50 characters max.'
                  labelPlacement='outside'
                  maxLength={50}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className='text-sm text-right opacity-60 mt-1'>
                  {description.length} / 50
                </div>
              </div>

              <Button
                color='primary'
                onPress={handleSubmit}
                fullWidth
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                className='text-black'
              >
                Submit
              </Button>
              {error &&
                <div className='text-danger text-center'>
                  {error}
                </div>
              }
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

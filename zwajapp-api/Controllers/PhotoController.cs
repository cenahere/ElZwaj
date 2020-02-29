using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using zwajapp_api.Data;
using zwajapp_api.Dtos;
using zwajapp_api.Helpers;
using zwajapp_api.Models;

namespace zwajapp_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("user/{userId}/photo")]
    public class PhotoController : ControllerBase
    {
        private readonly IZwajRepostiory _repo;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private readonly IMapper _mapper;
        private Cloudinary _cloudinary;
        public PhotoController(IZwajRepostiory repo, IOptions<CloudinarySettings> cloudinaryConfig, IMapper mapper)
        {
            _mapper = mapper;
            _cloudinaryConfig = cloudinaryConfig;
            _repo = repo;
            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );
            _cloudinary=new Cloudinary(acc);

        }
        [HttpGet("{id}",Name="GetPhoto")]
        public async Task<IActionResult> GetPhoto (int id)
        {
            var photoFromRepository = await _repo.GetPhoto(id);
            var photo=_mapper.Map<PhotoToReturnDto>(photoFromRepository);
            return Ok(photo);
        }
        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser (int userId , [FromForm]PhotoToCreateDto photoFToCreateDto )
        {
            // اختبار هل هو نفس اليوزر ام لا 
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            // جلب اليوزر
            var userFromRepo = await _repo.GetUser(userId,true); 
            // تجهيز الملف المطلوب رفعه
            var file = photoFToCreateDto.File;
            // متغير لرفع الصورة
            var uploadResult = new ImageUploadResult();
            // لو الملف موجود 
            if(file != null && file.Length > 0){
                // تخزين الملف
                using(var stream = file.OpenReadStream()){
                    var uploadParams = new ImageUploadParams(){
                        // انشاء الملف
                        File = new FileDescription(file.Name , stream),
                        // تنسيقات الصورة
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };
                    // النتيجة القادمة من ال Cloudinary
                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }
            // ربط الصورة المرفوعة بال Api
            photoFToCreateDto.Url=uploadResult.Uri.ToString();
            photoFToCreateDto.PublicId=uploadResult.PublicId;
            var photo = _mapper.Map<Photo>(photoFToCreateDto);
            // لو الصورة غير موجوده يجعلها الرئيسية
            if(! userFromRepo.Photos.Any(p=>p.IsMain))
            photo.IsMain=true;
            // اضافة الصورة
            userFromRepo.Photos.Add(photo);
            // الحفظ
            if(await _repo.SaveAll()){
                var photoToReturn = Mapper.Map<PhotoToReturnDto>(photo);
                // ربطها بالصور الخاصة بالعضو
                return CreatedAtRoute("GetPhoto" , new Photo{Id=photo.Id},photoToReturn);
            }
            // حال حدوث اي خطأ
            return BadRequest("خطأ في اضافة الصورة");
        }
        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId , int id)
        {
            // التاكد من اليوزر حامل التوكن
            if(userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            // الحصول علي اليورز
            var userFormRepo = await _repo.GetUser(userId,true);
            // لو الصورة غير تابعة لليوزر
            if(!userFormRepo.Photos.Any(p=>p.Id==id))
                return Unauthorized();
            // تحديد الصورة الاساسية بال id
            var desiredMainPhoto = await _repo.GetPhoto(id);
            // لو الصورة المختارة هي الاساسية بالفعل 
            if(desiredMainPhoto.IsMain)
                return BadRequest("هذه هي الصورة الاساسية بالفعل");
            // تحديد الصورة الاساسية
            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
            // التبديل بين الصورة 
            currentMainPhoto.IsMain=false;
            desiredMainPhoto.IsMain=true;
            // الحفظ
            if(await _repo.SaveAll())
                return NoContent();
            return BadRequest("لا يمكن تعديل الصورة الاساسية");
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto (int userId , int id)
        {
            // التاكد من المستخدم الحامل للتوكن
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            var userFromRepo = await _repo.GetUser(userId,true);
            if(!userFromRepo.Photos.Any(p=>p.Id==id))
                return Unauthorized();
            // الحصول علي الصورة
            var Photo = await _repo.GetPhoto(id);
            // لا تحذف اذا كانت الاساسية 
            if(Photo.IsMain)
                return BadRequest("لا يمكن حذف الصورة الاساسية");
            // الحذف من علي ال cloudinary-- نتمرير ال Public Id  للدالة destroy
            if(Photo.PublicId !=null){
                var deleteParams = new DeletionParams(Photo.PublicId);
                var result = this._cloudinary.Destroy(deleteParams);
                if(result.Result == "ok"){
                    _repo.Delete(Photo);
                }
            }
            // للحذف للصور الموجود علي القاعده بدون publicId
            if(Photo.PublicId == null){
                _repo.Delete(Photo);
            }
            // الحفظ
            if(await _repo.SaveAll())
                return Ok();
            return BadRequest("فشل في حذف الصورة");
        }

    }


}
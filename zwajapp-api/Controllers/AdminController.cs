using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using zwajapp_api.Data;
using zwajapp_api.Dtos;
using zwajapp_api.Helpers;
using zwajapp_api.Models;

namespace zwajapp_api.Controllers 
{
    [Route ("[controller]")]
    [ApiController]
    public class AdminController : ControllerBase {
        private readonly DataContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IOptions<CloudinarySettings> _CloudinaryConfig;
        private readonly Cloudinary _cloudinary;

        public AdminController (DataContext context, UserManager<User> userManager, IOptions<CloudinarySettings> CloudinaryConfig) {
            _CloudinaryConfig = CloudinaryConfig;
            _userManager = userManager;
            _context = context;

            Account acc = new Account(
                _CloudinaryConfig.Value.CloudName,
                _CloudinaryConfig.Value.ApiKey,
                _CloudinaryConfig.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(acc);
        }

        [HttpGet ("userWithRoles")]
        [Authorize (Policy = "RequireAdminRole")]
        public async Task<IActionResult> GetUsersWithRoles () {
            var userList = await (from user in _context.Users orderby user.UserName select new {
                Id = user.Id,
                    UserName = user.UserName,
                    Roles = (from userRole in user.UserRoles join role in _context.Roles on userRole.RoleId equals role.Id select role.Name).ToList ()
            }).ToListAsync ();
            return Ok (userList);
        }


        [Authorize (Policy = "RequireAdminRole")]
        [HttpPost ("editroles/{userName}")]
        public async Task<IActionResult> EditRoles (string userName, RoleEditDto roleEditDto) {
            var user = await _userManager.FindByNameAsync (userName);
            // تعرض الرتب المتاحة للمستخدم 
            var userRoles = await _userManager.GetRolesAsync (user);
            // معرفة الرتب التي سيتم اختيارها
            var selectedRoles = roleEditDto.RoleNames;
            // اختيار هل تم حذف المستخدم بالرتب ام لا بالترتب 
            // null collesing لو القيمة الشمال لا تساول الفارغ تاخذ القيمة  ولو القيمة الشمال فارغة تاخد القيمة ناحية اليمين
            selectedRoles = selectedRoles ?? new string[] { };
            var result = await _userManager.AddToRolesAsync (user, selectedRoles.Except (userRoles));
            if (!result.Succeeded)
                return BadRequest ("حدث خطأ أثناء إضافة الأدوار");
            result = await _userManager.RemoveFromRolesAsync (user, userRoles.Except (selectedRoles));
            if (!result.Succeeded)
                return BadRequest ("حدث خطأ أثناء حذف الأدوار");
            return Ok (await _userManager.GetRolesAsync (user));
        }

        [Authorize(Policy = "moderatorPhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
            var photos = await _context.Photos
                .Include(u => u.User)
                .IgnoreQueryFilters()
                .Where(p => p.IsApproved == false)
                .Select(u => new
                {
                    Id = u.Id,
                    UserName = u.User.UserName,
                    KnownAs = u.User.KnownAs,
                    Url = u.Url,
                    IsApproved = u.IsApproved
                }).ToListAsync();

            return Ok(photos);
        }

        [Authorize(Policy = "moderatorPhotoRole")]
        [HttpPost("approvePhoto/{photoId}")]
        public async Task<IActionResult> ApprovePhoto(int photoId)
        {
            var photo = await _context.Photos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == photoId);

            photo.IsApproved = true;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize(Policy = "moderatorPhotoRole")]
        [HttpPost("rejectPhoto/{photoId}")]
        public async Task<IActionResult> RejectPhoto(int photoId)
        {
            var photo = await _context.Photos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == photoId);

            if (photo.IsMain)
                return BadRequest("لا يمكنك رفض الصورة الأساسية");

            if (photo.PublicId != null)
            {
                var deleteParams = new DeletionParams(photo.PublicId);

                var result = _cloudinary.Destroy(deleteParams);

                if (result.Result == "ok")
                {
                    _context.Photos.Remove(photo);
                }
            }

            if (photo.PublicId == null)
            {
                _context.Photos.Remove(photo);
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
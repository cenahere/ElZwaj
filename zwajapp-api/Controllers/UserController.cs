using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using ZwajApp.API.Helpers;
using zwajapp_api.Data;
using zwajapp_api.Dtos;
using zwajapp_api.Helpers;
using zwajapp_api.Models;

namespace zwajapp_api.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [ApiController]
    [Route("[Controller]")]
    // ApiController مسئول عن ال Validation
    // ControllerBase مسئول عن 
    // 1- لا يدعم ال view يعتمد علي ال spa
    // 2- لو حذفنا ال base يدعم ال view
    //3- مسئول عن http request - IActionResault - return ok وغيرة من مسئوليات ال Api 
    public class UserController : ControllerBase
    {
        private readonly IZwajRepostiory _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<StripeSettings> _stripeSettings;
        private readonly IConverter _converter;
        public UserController(IConverter converter, IZwajRepostiory repo, IMapper mapper, IOptions<StripeSettings> stripeSettings)
        {
            _converter = converter;
            _stripeSettings = stripeSettings;
            _mapper = mapper;
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {

            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser(currentUserId, true);
            userParams.UserId = currentUserId;


            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "رجل" ? "إمرأة" : "رجل";
            }

            var users = await _repo.GetUsers(userParams);
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);
            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);
            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _repo.GetUser(id, true);
            var UserToReturn = _mapper.Map<UserForDetailsDto>(user);
            return Ok(UserToReturn);
        }
        // يجب مراعاه اسم البرمترز مساوي للمرر فوق مساوي للموجود في الموديل
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            var userFormRepo = await _repo.GetUser(id, true);
            _mapper.Map(userForUpdateDto, userFormRepo);
            if (await _repo.SaveAll())
            {
                return NoContent();
            }
            throw new Exception($"حدث مشكله في تعديل البيانات {id}");
        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            // التاكد من المستخدم الحالي
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            // استدعاء الدالة
            var like = await _repo.GetLike(id, recipientId);
            // لو فيه قيم يبقي فيه تطابق سابق 
            if (like != null)
                return BadRequest("لقد قمت بالاعجاب بهذا المشترك من قبل ");
            // هل الشخص موجود ام لا 
            if (await _repo.GetUser(recipientId, false) == null)
                return NotFound();
            // بانتهاء كل الخطوات السابقة يعني انه لم يتم الاعجاب من قبل هذا المستخدم بالجديد من قبل قنضيفة
            like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };
            _repo.Add<Like>(like);
            if (await _repo.SaveAll())
                return Ok();
            return BadRequest("فشل في الاعجاب");
        }

        [HttpPost("{userId}/charge/{stripeToken}")]
        public async Task<IActionResult> Charge(int userId, string stripeToken)

        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var customers = new CustomerService();
            var charges = new ChargeService();

            var customer = customers.Create(new CustomerCreateOptions
            {
                SourceToken = stripeToken
            });

            var charge = charges.Create(new ChargeCreateOptions
            {
                Amount = 5000,
                Description = "إشتراك مدى الحياة",
                Currency = "usd",
                CustomerId = customer.Id
            });

            var payment = new Payment
            {
                PaymentDate = DateTime.Now,
                Amount = charge.Amount / 100,
                UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value),
                ReceiptUrl = charge.ReceiptUrl,
                Description = charge.Description,
                Currency = charge.Currency,
                IsPaid = charge.Paid
            };
            _repo.Add<Payment>(payment);
            if (await _repo.SaveAll())
            {
                return Ok(new { IsPaid = charge.Paid });
            }

            return BadRequest("فشل في السداد");
        }

        [HttpGet("{userId}/payment")]
        public async Task<IActionResult> GetPaymentForUser(int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            var payment = await _repo.GetPaymentForUser(userId);
            return Ok(payment);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("UserReport/{userId}")]
        public IActionResult CreatePdfForUser(int userId)
        {
            // المسئول عن ارجاع محتوي التقرير 
            var templateGenerator = new TemplateGenerator(_repo, _mapper);
            // تنسيق التقرير او اعدادات التقرير
            var globalSettings = new GlobalSettings
            {
                ColorMode = ColorMode.Color,
                Orientation = Orientation.Portrait,
                PaperSize = PaperKind.A4,
                Margins = new MarginSettings { Top = 15, Bottom = 20 },
                DocumentTitle = "بطاقة مشترك"

            };
            // الاعدادات العامة
            var objectSettings = new ObjectSettings
            {
                // عدد الصفحات يشتغل ام لا 
                PagesCount = true,
                // محتوي التقرير اهم حاجة 
                HtmlContent = templateGenerator.GetHTMLStringForUser(userId),
                // اعدادات اللغة والوصول لمحتوي ال css
                WebSettings = { DefaultEncoding = "utf-8", UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "styles.css") },
                // line = false لانه لا يوجد نص يكتب في الهيدر
                HeaderSettings = { FontName = "Impact", FontSize = 12, Spacing = 5, Line = false },
                // اعدادت الفوتر مع ادراج نص 
                FooterSettings = { FontName = "Geneva", FontSize = 15, Spacing = 7, Line = true, Center = "Thanks For Me", Right = "[page]" }
            };

            var pdf = new HtmlToPdfDocument()
            {
                GlobalSettings = globalSettings,
                Objects = { objectSettings }
            };

            var file = _converter.Convert(pdf);
            return File(file, "application/pdf");
        }



    }
}